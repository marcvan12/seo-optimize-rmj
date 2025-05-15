'use server'
import ChatPageCSR from "./chatComponents/pageCSR";
import { admin } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchCurrency } from "../../../services/fetchFirebaseData";
import { getCountries, checkUserExist, getAccountData } from "../actions/actions";

export async function generateMetadata() {
  return {
    title: 'Transactions | REAL MOTOR JAPAN',
    description: "Transactions",
  };
};


export default async function ChatPage() {

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

  const currency = (await fetchCurrency()) || [];
  const countryList = await getCountries();

  const { exists, missingFields } = await checkUserExist(userEmail);
  if (!exists || (missingFields && missingFields.length > 0)) {
    redirect('/accountCreation');
  }
  const accountData = await getAccountData(userEmail)
  console.log(accountData)
  return (
    <>

      <ChatPageCSR accountData={accountData} userEmail={userEmail} currency={currency} countryList={countryList} />
    </>
  );
}