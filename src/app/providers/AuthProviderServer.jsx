// app/AuthProviderServer.jsx
import { cookies } from 'next/headers'
import { admin } from '@/lib/firebaseAdmin'
import AuthProvider from './AuthProvider'
import ClientAppCheck from '../../../firebase/ClientAppCheck'

export default async function AuthProviderServer({ children }) {
  // 1️⃣ Grab the long-lived session cookie (not the ID token)
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  // 2️⃣ If there's no session cookie, render as a guest
  if (!sessionCookie) {
    return <AuthProvider decodedToken={null}>{children}</AuthProvider>
  }

  // 3️⃣ Verify the session cookie (honors your 28-day expiresIn)
  let claims = null
  try {
    claims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, /* checkRevoked= */ true)
  } catch (err) {
    console.error('Session invalid or revoked:', err)
    // Optionally delete the bad cookie:
    // cookies().delete('session')
    return <AuthProvider decodedToken={null}>{children}</AuthProvider>
  }

  // 4️⃣ Pull out whatever claim you need (e.g. email)
  const email = claims?.email || null

  // 5️⃣ Render your app with a populated AuthProvider
  return (
    <AuthProvider decodedToken={email}>
      
      {children}
    </AuthProvider>
  )
}
