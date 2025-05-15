
export const dynamic = 'force-dynamic'
import { Geist, Geist_Mono } from "next/font/google";
import { fetchCurrency } from "../../services/fetchFirebaseData";
import "./globals.css";
import { CurrencyProvider } from "@/providers/CurrencyContext";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import AuthProviderServer from "./providers/AuthProviderServer";
import Providers from "./ProgressProvider";
import { admin } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import Script from "next/script";
import Gtag from "./components/G-tag";
import { fetchNotificationCounts } from "./actions/actions";
import Head from "next/head";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "REAL MOTOR JAPAN",
  description: "Established in 1979, offering affordable and quality used vehicles sourced in Japan.",
};

export default async function RootLayout({ children, params }) {
  const currency = await fetchCurrency() || [];
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) {
    // no session → render guest UI
    return (
      <html lang="en">
        <Head>
          <link
            rel="preload"
            as="image"
            href="/samplebanner3.avif"
            imagesrcset="
              /samplebanner3.avif?w=360   360w,
              /samplebanner3.avif?w=720   720w,
              /samplebanner3.avif?w=1080 1080w
            "
            imagesizes="(max-width: 720px) 250px, 100vw"
            fetchPriority="high"
          />
        </Head>
        <Gtag />

        <body>

          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-NJLD22H"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>

          <AuthProviderServer>

            <Providers>
              <CurrencyProvider currency={currency}>

                <ClientLayoutWrapper counts={null} userEmail={null} currency={currency}>
                  {children}


                </ClientLayoutWrapper>
              </CurrencyProvider>
            </Providers>

          </AuthProviderServer>
          <Script
            id="firebase-auth-iframe"
            src="https://real-motor-japan.firebaseapp.com/__/auth/iframe.js"
            strategy="afterInteractive"
          />
        </body>

      </html>
    )
  }
  let claims = null
  try {
    claims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, /* checkRevoked= */ true)
  } catch (e) {
    console.log('Session invalid:', e)
    // optionally clear the cookie so you don’t keep retrying

  }
  const userEmail = claims?.email
  const notificationCount = await fetchNotificationCounts({ userEmail })

  return (
    <html lang="en">
      <Head>
        <link
          rel="preload"
          as="image"
          href="/samplebanner3.avif"
          imagesrcset="
              /samplebanner3.avif?w=360   360w,
              /samplebanner3.avif?w=720   720w,
              /samplebanner3.avif?w=1080 1080w
            "
          imagesizes="(max-width: 720px) 250px, 100vw"
          fetchPriority="high"
        />
      </Head>
      <Gtag />
 
      <body className={`${geistSans.variable} ${geistMono.variable}`}>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NJLD22H"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <AuthProviderServer>

          <Providers>
            <CurrencyProvider currency={currency}>
              <ClientLayoutWrapper counts={notificationCount} userEmail={claims?.email || null} currency={currency}>
                {children}

              </ClientLayoutWrapper>
            </CurrencyProvider>
          </Providers>
        </AuthProviderServer>
        <Script
          id="firebase-auth-iframe"
          src="https://real-motor-japan.firebaseapp.com/__/auth/iframe.js"
          strategy="afterInteractive"
        />
      </body>

    </html>
  );
}
