'use server'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/firebaseAdmin";
import FavoritesPageCSR from "./favoriteComponents/favoriteMain";
import { fetchCurrency } from "../../../services/fetchFirebaseData";

import {
    fetchFavoriteStockIds, getDataFromStockId, getAccountData,
    fetchNotificationCounts, checkUserExist
} from "../actions/actions";
import ClientAppCheck from "../../../firebase/ClientAppCheck";

export async function generateMetadata({ params }) {
    return {
        title: 'Favorites | REAL MOTOR JAPAN',
        description: 'Favorites',
    }
};

export default async function FavoritePage() {
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
        // optionally clear the cookie so you don’t keep retrying

    }

    const userEmail = claims?.email;
    const { exists, missingFields } = await checkUserExist(userEmail);
    if (!exists || (missingFields && missingFields.length > 0)) {
        redirect('/accountCreation');
    }
    const stockIds = await fetchFavoriteStockIds({ userEmail })



    const dataVehicles = await Promise.all(
        stockIds.map(stockId => getDataFromStockId({ stockId }))
    );

    const currency = await fetchCurrency();
    const accountData = await getAccountData(userEmail);
    const count = await fetchNotificationCounts({ userEmail })
    return (
        <>
            <ClientAppCheck />
            <FavoritesPageCSR userEmail={userEmail} count={count} dataVehicles={dataVehicles} currency={currency} accountData={accountData} />
        </>


    )
}