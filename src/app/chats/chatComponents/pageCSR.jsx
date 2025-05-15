'use client'
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCustomChat } from "./useCustomChat"
import TransactionCSR from "./TransactionCSR"
import TransactionList from "./TransactionListCSR"
import { doc, query, collection, where, orderBy, limit, onSnapshot, startAfter, getDocs, updateDoc } from "firebase/firestore"
import { firestore } from "../../../../firebase/clientApp"
import { loadMoreMessages, getBookingData } from "@/app/actions/actions"
import { SortProvider } from "@/app/stock/stockComponents/sortContext"

let lastVisible = null;
export function subscribeToChatList(
    userEmail,
    keywordArrayOrCallback = [],
    callbackOptional
) {
    if (!userEmail) return () => { }

    // detect args
    const is2ndArgFunction = typeof keywordArrayOrCallback === "function"
    const keywordArray = is2ndArgFunction
        ? []
        : Array.isArray(keywordArrayOrCallback)
            ? keywordArrayOrCallback
            : []
    const callback = is2ndArgFunction
        ? keywordArrayOrCallback
        : callbackOptional

    /** @type {QueryConstraint[]} */
    const constraints = [
        where("participants.customer", "==", userEmail),
    ]

    if (keywordArray.length > 0) {
        constraints.push(
            where("keywords", "array-contains-any", keywordArray)
        )
    }

    constraints.push(
        orderBy("lastMessageDate", "desc"),
        limit(12)
    )

    const q = query(collection(firestore, "chats"), ...constraints)

    const unsubscribe = onSnapshot(
        q,
        snapshot => {
            const chatList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            callback(chatList)
            lastVisible =
                snapshot.docs[snapshot.docs.length - 1] || lastVisible
        },
        err => console.error("Error fetching chat list:", err)
    )

    return unsubscribe
}

const subscribeToMessages = (id, callback) => {
    if (!id) {
        return () => { } // Return a no-op unsubscribe function if there's no id
    }
    // Reference to the messages collection for the specified chat
    const messagesRef = collection(firestore, "chats", id, "messages")
    // Build a query that orders by timestamp descending and limits to 15 messages
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(15))

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
        messagesQuery,
        (querySnapshot) => {
            const messages = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                // Convert the timestamp to a string if it exists
                timestamp: doc.data().timestamp ? doc.data().timestamp.toString() : null,
            }))
            callback(messages)
        },
        (error) => {
            console.error("Error fetching messages: ", error)
        },
    )

    // Return the unsubscribe function to clean up the listener when needed
    return unsubscribe
}

export function subscribeToInvoiceData(invoiceNumber, callback) {
    if (!invoiceNumber) {
        return () => { } // No-op unsubscribe if no invoice number is provided
    }

    console.time("invoiceLoadTime")
    const invoiceDocRef = doc(firestore, "IssuedInvoice", invoiceNumber)

    const unsubscribe = onSnapshot(invoiceDocRef, (docSnapshot) => {
        try {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data()
                let formattedDate = "No due date available"

                const dueDate = data?.bankInformations?.dueDate
                if (dueDate) {
                    formattedDate = new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                    }).format(new Date(dueDate))
                }

                callback({ invoiceData: data, formattedDate })
            } else {
                console.log("No such invoice document!")
                callback({ invoiceData: null, formattedDate: "No due date available" })
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            callback({ invoiceData: null, formattedDate: "Error fetching due date" })
        }
    })

    return unsubscribe
};

export async function loadMoreChatList(userEmail, callback) {
    if (!userEmail || !lastVisible) {
        // nothing to load
        callback([], true);
        return;
    }

    try {
        const nextQuery = query(
            collection(firestore, "chats"),
            where("participants.customer", "==", userEmail),
            orderBy("lastMessageDate", "desc"),
            startAfter(lastVisible),
            limit(10)
        );

        const snap = await getDocs(nextQuery);
        const moreChats = snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
            };
        });

        // update cursor
        lastVisible = snap.docs[snap.docs.length - 1] || lastVisible;

        // if we got fewer than `limit`, we've hit the end
        const noMore = snap.docs.length < 10;
        callback(moreChats, noMore);
    } catch (err) {
        console.error("Error loading more chats:", err);
        callback([], true);
    }
}
export async function makeTrueRead(chatId) {
    try {
        const chatRef = doc(firestore, "chats", chatId);
        await updateDoc(chatRef, { customerRead: true });
    } catch (error) {
        console.error("Error marking read:", error);
    }
};

const fetchVehicleStatuses = (stockIDs, updateStatuses) => {
    if (!stockIDs || stockIDs.length === 0) return;

    // Store unsubscribe functions to clean up listeners
    const unsubscribeMap = {};

    // Set up onSnapshot for each stockID in VehicleProducts
    stockIDs.forEach((stockID) => {
        const docRef = doc(firestore, 'VehicleProducts', stockID);

        // Listen for real-time updates on each document
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                updateStatuses(stockID, { stockStatus: data.stockStatus, reservedTo: data.reservedTo });
            } else {
                console.log(`No document for stockID: ${stockID}`);
                updateStatuses(stockID, { stockStatus: null, reservedTo: null });
            }
        });

        // Store each unsubscribe function
        unsubscribeMap[stockID] = unsubscribe;
    });

    // Return a cleanup function to remove all listeners when needed
    return () => {
        Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
    };
};

export default function ChatPageCSR({ accountData, userEmail, currency, fetchInvoiceData, countryList }) {
    //change this to the server side token
    const [searchQuery, setSearchQuery] = useState("")
    const [chatList, setChatList] = useState([])
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [vehicleStatus, setVehicleStatus] = useState([]);
    const [bookingData, setBookingData] = useState({})
    const router = useRouter()
    const pathname = usePathname() // e.g. "/chats/chat_2024040429_ryowell0921@gmail.com"
    const [selectedContact, setSelectedContact] = useState(null)
    const { messages, sendMessage, isLoading } = useCustomChat(selectedContact?.id)
    const [chatId, setChatId] = useState("")
    const [chatMessages, setChatMessages] = useState([])
    const [invoiceData, setInvoiceData] = useState({})
    const [lastTimestamp, setLastTimestamp] = useState("")
    const [isMobileView, setIsMobileView] = useState(false)

    // Check if we're on mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 1024)
        }

        checkMobileView()
        window.addEventListener("resize", checkMobileView)

        return () => {
            window.removeEventListener("resize", checkMobileView)
        }
    }, [])

    // Check if we're on a specific chat route
    const isDetailView = pathname.includes("/chats/") && pathname !== "/chats"

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToMessages(chatId, (msgs) => {
            setChatMessages(msgs)
            // Set the last timestamp (cursor) based on the oldest message in the array
            if (msgs && msgs.length > 0) {
                setLastTimestamp(msgs[msgs.length - 1].timestamp)
            }
        })

        // Clean up the listener on unmount or when chatId changes
        return () => unsubscribe()
    }, [chatId])

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToInvoiceData(selectedContact?.invoiceNumber, (msgs) => {
            setInvoiceData(msgs)
        })

        // Clean up the listener on unmount or when chatId changes
        return () => unsubscribe()
    }, [selectedContact?.invoiceNumber])

    useEffect(() => {
        const segments = pathname.split("/");
        const chatIdFromPath = segments[2]; // expected to be something like 'chat_2024040429_ryowell0921@gmail.com'

        if (chatIdFromPath) {
            const emailFromChatId = chatIdFromPath.split("_").pop();
            if (emailFromChatId !== userEmail) {
                router.push("/"); // redirect if email in URL doesn't match logged-in user
            } else {
                setChatId(chatIdFromPath); // only set chatId if it's valid
            }
        }
    }, [pathname, userEmail]);

    const handleSelectContact = (contact) => {
        router.push(`/chats/${contact.id}`, undefined, { shallow: true })
    }

    const handleBackToList = () => {
        router.push("/chats")
    }

    const [loadMain, setLoadMain] = useState(true)
    useEffect(() => {
        if (chatList && chatList.length > 0) {
            const selectedChat = chatList.find((chat) => chat.id === chatId)
            if (selectedChat) {
                setSelectedContact(selectedChat)
                setLoadMain(false)
            }
        }
    }, [chatId, chatList])

    const handleLoadMore = async () => {
        try {
            const newMessages = await loadMoreMessages(chatId, lastTimestamp)
            if (newMessages.length > 0) {
                // Prepend new messages and update the cursor with the last message's timestamp
                setChatMessages((prev) => [...prev, ...newMessages])
                const newLast = newMessages[newMessages.length - 1].timestamp
                setLastTimestamp(newLast)
            }
        } catch (error) {
            console.error("Error loading more messages:", error)
        }
    }
    useEffect(() => {
        if (!userEmail) return

        const trimmedQuery = searchQuery.trim()

        // If there's no search query, use default subscription
        if (!trimmedQuery) {
            const unsubscribe = subscribeToChatList(userEmail, (newChatList) => {
                setChatList(newChatList)
                setHasMore(newChatList.length === 12)
            })

            return () => unsubscribe()
        }

        // If there is a search query, use keyword-based subscription
        const keywords = [trimmedQuery]

        const unsubscribe = subscribeToChatList(userEmail, keywords, (newChatList) => {
            setChatList(newChatList)
            setHasMore(newChatList.length === 12)
        })

        return () => unsubscribe()
    }, [userEmail, searchQuery])


    useEffect(() => {
        // Reset state when chatId changes
        setChatMessages([])
        setLastTimestamp(null)
        setInvoiceData({})
        setBookingData({})
    }, [chatId])

    const [error, setError] = useState()

    useEffect(() => {
        // only fire when we have both values
        if (!userEmail || !selectedContact?.invoiceNumber) return

        // define an async fn inside
        async function fetchBooking() {
            try {
                const data = await getBookingData(selectedContact?.invoiceNumber, userEmail)
                setBookingData(data)
            } catch (err) {
                console.error(err)
                setError(err.message || "Failed to load booking")
            }
        }

        fetchBooking()
    }, [userEmail, selectedContact?.invoiceNumber])


    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);

        loadMoreChatList(userEmail, (moreChats, noMore) => {
            setChatList((prev) => [...prev, ...moreChats]);
            setHasMore(!noMore);
            setLoadingMore(false);
        });
    }, [userEmail, hasMore, loadingMore]);

    useEffect(() => {
        const stockIDs = chatList.map(chat => chat.carData?.stockID).filter(Boolean);

        const updateStatuses = (stockID, status) => {
            setVehicleStatus(prevStatus => ({
                ...prevStatus,
                [stockID]: status
            }));
        };

        const cleanup = fetchVehicleStatuses(stockIDs, updateStatuses);

        return () => {
            if (cleanup) cleanup();
        };
    }, [chatList])

    return (
        <SortProvider>
      
            <div className="flex h-screen bg-gray-50">
   
                <aside
                    className={`${isMobileView && isDetailView ? "hidden" : "w-full"} lg:max-w-[350px] border-r border-gray-200 overflow-y-auto`}
                >
                    <TransactionList
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        makeTrueRead={makeTrueRead}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        bookingData={bookingData}
                        setSelectedContact={setSelectedContact}
                        selectedContact={selectedContact}
                        onSelectContact={handleSelectContact}
                        chatId={chatId}
                        loadMore={loadMore}
                        userEmail={userEmail}
                        setChatList={setChatList}
                        chatList={chatList}
                        vehicleStatus={vehicleStatus}
                    />
                </aside>

                <main className={`${isMobileView && !isDetailView ? "hidden" : "w-full"} h-full overflow-y-auto`}>


                    {!loadMain ? (
                        <TransactionCSR
                            vehicleStatus={vehicleStatus}
                            accountData={accountData}
                            isMobileView={isMobileView}
                            isDetailView={isDetailView}
                            handleBackToList={handleBackToList}
                            bookingData={bookingData}
                            countryList={countryList}
                            currency={currency}
                            dueDate={invoiceData?.formattedDate}
                            handleLoadMore={handleLoadMore}
                            invoiceData={invoiceData.invoiceData}
                            chatId={chatId}
                            userEmail={userEmail}
                            chatMessages={chatMessages}
                            contact={selectedContact}
                            messages={messages}
                            onSendMessage={sendMessage}
                            isLoading={isLoading}
                        />
                    ) : (
                        chatList.length > 0 ?
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="text-gray-400 mb-4">
                                    <h3 className="text-xl font-medium mt-4">Select a transaction</h3>
                                </div>
                            </div> :
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="text-gray-400 mb-4">
                                    <h3 className="text-xl font-medium mt-4">No orders yet</h3>
                                    <p className="mt-2 text-gray-500">Browse our car stock and add vehicles to your order list.</p>
                                </div>
                                <Link href={'/stock'} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                    Browse Car Stock
                                </Link>
                            </div>
                    )}
                </main>
            </div>
        </SortProvider>
    )
}
