import { setCookie } from 'cookies-next/server'
import { admin } from '@/lib/firebaseAdmin'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    const { token } = req.body
    console.log('🔍 [login-api] received body:', req.body)

    if (!token) {
        console.error('❌ [login-api] No token in request body')
        return res.status(400).json({ error: 'Missing token' })
    }

    try {
        // (Optional) Double-check the ID token itself is valid
        const decoded = await admin.auth().verifyIdToken(token)
        console.log('✅ [login-api] verifyIdToken succeeded for', decoded.uid)

        // Now mint your session cookie
        const expiresIn = 14 * 24 * 60 * 60 * 1000
        const sessionCookie = await admin
            .auth()
            .createSessionCookie(token, { expiresIn })

        setCookie('session', sessionCookie, {
            req,
            res,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 28 * 24 * 60 * 60,
        })

        console.log('✅ [login-api] session cookie set')
        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('❌ [login-api] error:', error.code || error.message)
        return res
            .status(401)
            .json({ error: error.code || error.message || 'Invalid or expired token' })
    }
}
