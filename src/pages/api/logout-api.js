// pages/api/logout.js
import { deleteCookie } from 'cookies-next/server'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Delete the session cookie
  deleteCookie('session', { req, res, path: '/' })

  return res.status(200).json({ message: 'Logged out successfully' })
}
