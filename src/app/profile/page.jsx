'use server'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAccountData, getCountries, checkUserExist, fetchNotificationCounts } from "../actions/actions";
import { admin } from "@/lib/firebaseAdmin";
import ProfilePage from "./profileComponents/profileMain";
import { Toaster } from "sonner";

export async function generateMetadata({ params }) {
    return {
        title: 'Profile | REAL MOTOR JAPAN',
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
            .verifySessionCookie(sessionCookie, /* checkRevoked= */ true)


    } catch (e) {
        console.log('Session invalid:', e)

    }



    const userEmail = claims?.email;
    const { exists, missingFields } = await checkUserExist(userEmail);
    if (!exists || (missingFields && missingFields.length > 0)) {
        redirect('/accountCreation');
    }
    const accountData = await getAccountData(userEmail);

    const countryList = await getCountries();
    const count = await fetchNotificationCounts({ userEmail });
    return (
        <>

            <Toaster />
            <ProfilePage count={count} userEmail={userEmail} accountData={accountData} countryList={countryList} /></>

    )
}