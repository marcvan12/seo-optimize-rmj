"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import {  setOrderItem } from "@/app/actions/actions"
// Add custom animation styles
import { cn } from "@/lib/utils"
import Modal from "@/app/components/Modal"
import InvoiceAmendmentForm from "./amendInvoice"
import Loader from "@/app/components/Loader"
import moment from "moment"
const animationStyles = {
    "@keyframes scaleIn": {
        "0%": { transform: "scale(0)", opacity: "0" },
        "100%": { transform: "scale(1)", opacity: "1" },
    },
    "@keyframes fadeIn": {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
    },
}

export default function OrderButton({ accountData, isOrderMounted, setIsOrderMounted, userEmail, chatId, selectedChatData, countryList }) {
    const [ordered, setOrdered] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    // useEffect(() => {
    //     onMount?.()
    //     return () => onUnmount?.()
    // }, [])

    //jackall payment section (disable first since it is not prod mode)
    // let momentDate;
    // let formattedSalesDate;
    // Promise.all([
    //     fetch('https://asia-northeast2-samplermj.cloudfunctions.net/ipApi/ipInfo'),
    //     fetch('https://asia-northeast2-samplermj.cloudfunctions.net/serverSideTimeAPI/get-tokyo-time')
    // ])
    //     .then(([ipInfoResponse, tokyoTimeResponse]) => {
    //         // parse both bodies
    //         return Promise.all([
    //             ipInfoResponse.json(),
    //             tokyoTimeResponse.json()
    //         ]);
    //     })
    //     .then(([ipInfo, tokyoTime]) => {
    //         console.log('IP Info:', ipInfo);
    //         console.log('Tokyo Time:', tokyoTime);

    //         // Now you have the parsed `tokyoTime` object:
    //         momentDate = moment(
    //             tokyoTime?.datetime,               // use the JSON result here
    //             'YYYY/MM/DD HH:mm:ss.SSS'
    //         );
        
    //          formattedSalesDate = momentDate.format('YYYY/MM/DD');
    //          console.log('Tokyo Time RIP:',formattedSalesDate)
    //     })
    //     .catch(err => {
    //         console.error('Fetch error:', err);
    //     });

    

    // const uploadJackallSalesInfoData = async ({
    //     id,
    //     stock_system_id,
    //     sales_date,
    //     fob,
    //     freight,
    //     insurance,
    //     inspection,
    //     cost_name1,
    //     cost1,
    //     cost_name2,
    //     cost2,
    //     cost_name3,
    //     cost3,
    //     cost_name4,
    //     cost4,
    //     cost_name5,
    //     cost5,
    //     coupon_discount,
    //     price_discount,
    //     subtotal,
    //     clients,
    //     sales_pending,
    // }) => {

    //     try {
    //         const response = await fetch('https://asia-northeast2-real-motor-japan.cloudfunctions.net/uploadJackallSalesInfo', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify([{
    //                 id: id,
    //                 stock_system_id: stock_system_id,
    //                 sales_date: sales_date,
    //                 fob: fob,
    //                 freight: freight,
    //                 insurance: insurance,
    //                 inspection: inspection,
    //                 cost_name1: cost_name1,
    //                 cost1: cost1,
    //                 cost_name2: cost_name2,
    //                 cost2: cost2,
    //                 cost_name3: cost_name3,
    //                 cost3: cost3,
    //                 cost_name4: cost_name4,
    //                 cost4: cost4,
    //                 cost_name5: cost_name5,
    //                 cost5: cost5,
    //                 coupon_discount: coupon_discount,
    //                 price_discount: price_discount,
    //                 subtotal: subtotal,
    //                 clients: clients,
    //                 sales_pending: sales_pending,
    //             }, // Adjust based on your CSV structure
    //             ]),
    //         });

    //         if (response.ok) {
    //             // console.log('Success', 'Data appended successfully to CSV.');
    //         } else {
    //             // console.log('Error', 'Failed to append data to CSV.');
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         // console.log('Error', 'An error occurred.');
    //     }
    // };
    // const prepareSalesData = (newId) => {
    //     let salesData = {
    //         id: `${newId}`,
    //         stock_system_id: `${selectedChatData?.carData?.jackall_id || ''}`,
    //         sales_date: `${formattedSalesDate}`,
    //         fob: 0,
    //         freight: 0,
    //         insurance: 0,
    //         inspection: 0,
    //         cost_name1: '0',
    //         cost1: 0,
    //         cost_name2: '0',
    //         cost2: 0,
    //         cost_name3: '0',
    //         cost3: 0,
    //         cost_name4: '0',
    //         cost4: 0,
    //         cost_name5: '0',
    //         cost5: 0,
    //         coupon_discount: 0,
    //         price_discount: 0,
    //         subtotal: 0,
    //         clients: `${accountData.client_id || ''}`,
    //         sales_pending: "1"
    //     };

    //     return salesData;
    // };
    // await processJackallSalesInfo({ chatId }); 
    //open when real database
    //jackall payment section



    const handleOrder = async () => {
        setIsLoading(true)
        setOrdered(true);
        setIsOrderMounted(true);
        try {
            const result = await setOrderItem(chatId, selectedChatData, userEmail);
            console.log('Order result:', result);
            setIsLoading(false)
        } catch (error) {
            console.error('Error setting order item:', error);
        }
    };
    // Define animation classes
    const animateScaleIn = "transition-all duration-500 animate-[scaleIn_0.5s_ease-out]"
    const animateFadeIn = "transition-all duration-500 animate-[fadeIn_0.6s_ease-out]"
    const animateFadeInDelay = "transition-all duration-500 animate-[fadeIn_0.8s_ease-out]"

    return (
        <>

            <Button size="sm" onClick={handleOrder} className="ml-2 font-medium bg-red-500 hover:bg-red-600 text-white">
                Order Now
            </Button>

            {ordered && (
                <Modal context={'order'} showModal={isOrderMounted} setShowModal={setIsOrderMounted}>
                    {isLoading === false ? (
                        <Card className="max-w-md mx-auto animate-zoomIn">
                            <CardHeader>
                                <CardTitle>Product Order</CardTitle>
                                <CardDescription>
                                    Order completed!
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center space-y-4 py-6">
                                    <div className={animateScaleIn}>
                                        <CheckCircle className="h-16 w-16 text-green-500" />
                                    </div>
                                    <p className={cn("text-center text-lg font-medium", animateFadeIn)}>
                                        This unit has been reserved in your name.
                                    </p>
                                    <p className={cn("text-center text-sm text-muted-foreground", animateFadeInDelay)}>
                                        For amendment kindly click the Amend Invoice button below.
                                    </p>
                                </div>
                            </CardContent>
                            {ordered && (
                                <CardFooter className="flex justify-center">
                                    <InvoiceAmendmentForm accountData={accountData} userEmail={userEmail} chatId={chatId} countryList={countryList} />
                                </CardFooter>
                            )}
                        </Card>
                    ) : (<Loader />)}

                </Modal>

            )}


        </>

    )
}

