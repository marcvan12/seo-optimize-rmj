
'use server'
import MainOrderPage from "./orderComponents/orderMain";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/firebaseAdmin";
import { fetchNotificationCounts, getAccountData, checkUserExist } from "../actions/actions";
import { fetchCurrency, } from "../../../services/fetchFirebaseData";
import ClientAppCheck from "../../../firebase/ClientAppCheck";
export async function generateMetadata({ params }) {
    return {
        title: 'Orders | REAL MOTOR JAPAN',
        description: 'Orders',
    }
};

export default async function OrderPage() {
    let claims = null

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return redirect('/login')
    }
    try {
        claims = await admin
            .auth()
            .verifySessionCookie(sessionCookie, true)
    } catch (e) {
        console.log('Session invalid:', e)
        // optionally clear the cookie so you don’t keep retrying

    }

    const userEmail = claims?.email;
    const { exists, missingFields } = await checkUserExist(userEmail);
    if (!exists || (missingFields && missingFields.length > 0)) {
        redirect('/accountCreation');
    };
    const currency = await fetchCurrency();
    const accountData = await getAccountData(userEmail);
    const count = await fetchNotificationCounts({ userEmail });


    return (
        <>
            <ClientAppCheck />
            <MainOrderPage count={count} currency={currency} userEmail={userEmail} accountData={accountData} />
        </>
    )
}