"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import moment from "moment"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Send, X, Download } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import CarDetails from "./carDetails"
import ActionButtonsChat from "./actionButtonsChat"
import { AnnouncementBar } from "./announcementBar"
import PreviewInvoice from "./previewInvoice"
import DeliveryAddress from "./deliveryAddress"
import { updateCustomerFiles } from "@/app/actions/actions"
import ChatMessage from "./messageLinks"

export default function TransactionCSR({ vehicleStatus, accountData, isMobileView, isDetailView, handleBackToList, bookingData, countryList, currency, dueDate, handleLoadMore, invoiceData, userEmail, contact, messages, onSendMessage, isLoading, chatId, chatMessages }) {
    const [newMessage, setNewMessage] = useState("");

    const scrollAreaRef = useRef(null)
    const endOfMessagesRef = useRef(null);
    const startOfMessagesRef = useRef(null);
    const fileInputRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [loadingSent, setLoadingSent] = useState(false)

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAttachedFile(file);
        console.log("File attached:", file.name);
    };
    const handleSendMessage = async (e) => {
        setLoadingSent(true)
        e.preventDefault();

        // If there is no text and no file, do nothing.
        if (!newMessage.trim() && !attachedFile) return;

        try {
            // Fetch IP info and Tokyo time concurrently.
            const [ipInfoResponse, tokyoTimeResponse] = await Promise.all([
                fetch('https://asia-northeast2-samplermj.cloudfunctions.net/ipApi/ipInfo'),
                fetch('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time')
            ]);

            if (!ipInfoResponse.ok) {
                throw new Error("Failed to fetch IP Info");
            }
            if (!tokyoTimeResponse.ok) {
                throw new Error("Failed to fetch Tokyo Time");
            }

            const [ipInfo, tokyoTime] = await Promise.all([
                ipInfoResponse.json(),
                tokyoTimeResponse.json()
            ]);

            // Format the received Tokyo time using moment.js
            const momentDate = moment(tokyoTime?.datetime, 'YYYY/MM/DD HH:mm:ss.SSS');
            const formattedTime = momentDate.format('YYYY/MM/DD [at] HH:mm:ss');

            // Extract IP info details
            const ip = ipInfo.ip;
            const ipCountry = ipInfo.country_name;
            const ipCountryCode = ipInfo.country_code;

            if (attachedFile) {
                // If a file is attached, prepare a message that includes the file.
                // If no text is provided, set a default text.
                const messageValueToSend = newMessage.trim() ? newMessage : "File attached.";

                await updateCustomerFiles({
                    chatId,
                    selectedFile: attachedFile,
                    userEmail,
                    messageValue: messageValueToSend,
                });
                console.log('File (and optional text) message sent successfully.');
            } else if (newMessage.trim()) {
                // If only a text message exists, prepare the payload
                const bodyData = {
                    chatId,
                    newMessage,
                    userEmail,
                    formattedTime,
                    ip,
                    ipCountry,
                    ipCountryCode,
                };

                // Send text-only message via your admin API route.
                const apiResponse = await fetch("/api/sendMessage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyData),
                });

                if (!apiResponse.ok) {
                    throw new Error("Failed to send message via admin API");
                }
            }

            // Clear input fields on success.
            setNewMessage("");
            setAttachedFile(null);
            setLoadingSent(false)
        } catch (error) {
            console.error("Error sending message:", error);
            setLoadingSent(false)
        } finally {
            setNewMessage("");
            setAttachedFile(null);
        }
    };


    // Scroll to bottom when messages change

    // useEffect(() => {
    //     if (endOfMessagesRef.current) {
    //         endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" })
    //     }
    // }, [chatMessages])
    // const invoiceData = '';

    // const baseFinalPrice = (basePrice) + (parseFloat(carData?.dimensionCubicMeters) * parseFloat(profitMap));
    // const finalPrice = ((baseFinalPrice + (inspectionToggle ? inspectionPrice || 300 : 0)));
    const renderTextWithLinks = (text) => {
        // Regular expression to match URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        if (!text) return null;

        const parts = text.split(urlRegex);
        const matches = text.match(urlRegex) || [];

        return (
            <>
                {parts.map((part, index) => {
                    // If this part is a URL, render it as a link
                    if (matches.includes(part)) {
                        return (
                            <Link
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white-600 underline hover:underline"
                            >
                                {part}
                            </Link>
                        );
                    }
                    // Otherwise, render it as regular text
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages]);
    const { stockStatus, reservedTo } = vehicleStatus[contact.carData.stockID] || {};
    const isReservedOrSold = (stockStatus === "Reserved" || stockStatus === "Sold") && reservedTo !== userEmail
    return (
        <div className="flex flex-col h-full">




            <div className="relative w-full">

                <div className="relative z-[5]">
                    {/* this is your dynamic‐height content */}
                    <CarDetails
                        accountData={accountData}
                        isDetailView={isDetailView}
                        isMobileView={isMobileView}
                        handleBackToList={handleBackToList}
                        bookingData={bookingData}
                        countryList={countryList}
                        currency={currency}
                        dueDate={dueDate}
                        contact={contact}
                        invoiceData={invoiceData}
                    />

                    {/* your existing action buttons (still in flow) */}
                    {contact.stepIndicator.value >= 2 && (
                        <ActionButtonsChat
                            accountData={accountData}
                            bookingData={bookingData}
                            chatId={chatId}
                            countryList={countryList}
                            selectedChatData={contact}
                            invoiceData={invoiceData}
                            userEmail={userEmail}
                            vehicleStatus={vehicleStatus}
                        />
                    )}

                    {/* announcement bar pulled out of flow but placed at parent’s bottom */}
                    {(contact.stepIndicator.value === 2 || contact.stepIndicator.value === 3 || isReservedOrSold) && (
                        <div className="absolute top-full left-0 w-full z-[1] px-1 mt-1">
                            <AnnouncementBar
                                invoiceData={invoiceData}
                                accountData={accountData}
                                chatId={chatId}
                                selectedChatData={contact}
                                countryList={countryList}
                                userEmail={userEmail}
                                vehicleStatus={vehicleStatus}
                            />
                        </div>
                    )}
                </div>



            </div>

            <ScrollArea

                onScrollCapture={(event) => {
                    if (event.target.scrollTop === 0) {
                        handleLoadMore();
                    }
                }}

                ref={scrollAreaRef} className="h-full p-4 custom-scroll bg-[#E5EBFE]"
            >
                <div className="space-y-4 mt-8">
                    {chatMessages.slice().reverse().map((message, index) => (
                        <div key={index} className="w-full">
                            <div className={`flex w-full ${message.sender === userEmail ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] p-3 rounded-lg ${message.sender === userEmail
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none"
                                        }`}
                                >
                                    {!message.messageType && (
                                        <p
                                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                        >
                                            {renderTextWithLinks(message.text)}
                                        </p>
                                    )}

                                    {message.messageType === 'InvoiceAmendment' && (
                                        <p
                                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", }}
                                            className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                        >
                                            {renderTextWithLinks(message.text)}
                                        </p>
                                    )}
                                    {message.messageType === 'FullPayment' && (
                                        <p
                                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                        >
                                            {renderTextWithLinks(message.text)}
                                        </p>
                                    )}
                                    {message.messageType === 'InputPayment' && (
                                        <p
                                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                        >
                                            {renderTextWithLinks(message.text)}
                                        </p>
                                    )}
                                    {message.messageType === 'IssuedInvoice' && (
                                        <>
                                            <p
                                                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                            >
                                                {renderTextWithLinks(message.text)}
                                            </p>
                                            <div className={`mt-2 flex justify-${message.sender === userEmail ? "end" : "start"}`}>

                                                <PreviewInvoice accountData={accountData} selectedChatData={contact} invoiceData={invoiceData} />
                                            </div>
                                        </>

                                    )}
                                    {message.messageType === 'InputDocDelAdd' && (
                                        <>
                                            <p
                                                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                className={message.sender === userEmail ? "text-white" : "text-gray-800"}
                                            >
                                                {renderTextWithLinks(message.text)}
                                            </p>
                                            <div className={`mt-2 flex justify-${message.sender === userEmail ? "end" : "start"}`}>
                                                <DeliveryAddress accountData={accountData} countryList={countryList} chatId={chatId} userEmail={userEmail} />
                                            </div>
                                        </>

                                    )}

                                    {message.messageType === 'important' && (
                                        <div
                                            className={`flex flex-col ${message.sender === userEmail ? 'items-end' : 'items-start'
                                                } space-y-4`}
                                        >

                                            <div
                                                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                className="text-base"
                                            >
                                                {message.text}
                                            </div>

                                            {message.text.includes('SI') && bookingData[0]?.sI?.url && (
                                                <Button
                                                    variant="default"
                                                    className="gap-2 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                                    onClick={() => window.open(bookingData[0].sI.url, '_blank')}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>Download SI</span>
                                                </Button>
                                            )}


                                            {message.text.includes('B/L') && bookingData[0]?.bL?.url && (
                                                <Button
                                                    variant="default"
                                                    className="gap-2 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                                    onClick={() => window.open(bookingData[0].bL.url, '_blank')}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>Download BL</span>
                                                </Button>
                                            )}
                                        </div>
                                    )}



                                    <ChatMessage accountData={accountData} message={message} userEmail={userEmail} />

                                </div>
                            </div>


                            <div className={`w-full flex ${message.sender === userEmail ? "justify-end" : "justify-start"}`}>
                                <span className="text-xs text-gray-500">
                                    {message.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
            </ScrollArea>

            <ChatInput accountData={accountData} loadingSent={loadingSent} setAttachedFile={setAttachedFile} fileInputRef={fileInputRef} attachedFile={attachedFile} handleFileUpload={handleFileUpload} userEmail={userEmail} chatId={chatId} newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    )
}

export function ChatInput({
    newMessage,
    setNewMessage,
    handleSendMessage,
    isLoading,
    handleFileUpload,
    attachedFile,
    fileInputRef,
    setAttachedFile,
    loadingSent,
    accountData
}) {




    // Calculate rows based on newline count: minimum 1, maximum 4
    const computedRows = Math.min(
        Math.max(newMessage.split("\n").length, 1),
        6
    )

    return (
        <div className="p-4 border-t border-gray-200">
            {/* File attachment preview - now positioned ABOVE the form */}
            {attachedFile && (
                <div className="mb-3 p-2 bg-gray-50 rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                            {attachedFile.name}
                            <span className="text-gray-500 text-xs ml-1">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                        </span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAttachedFile(null)} className="h-6 w-6 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Textarea
                    rows={computedRows}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 resize-none"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        // If Enter is pressed without Shift, send the message.
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                        }
                    }}
                />
                {/* File upload button */}
                <Button type="button" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <Paperclip className="h-4 w-4" />
                </Button>
                {/* Send button */}
                <Button
                    type="submit"
                    size="icon"
                    disabled={(!newMessage.trim() && !attachedFile) || isLoading || loadingSent}
                >
                    {loadingSent ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
                {/* Hidden file input */}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" aria-label="Upload file" />
            </form>
        </div>
    )
}