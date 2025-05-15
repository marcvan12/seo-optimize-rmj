// lib/firebaseAdmin.js
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let appConfig;
if (process.env.NODE_ENV !== 'production') {
  // ─── LOCAL: use your service‐account key ───────────────────────────
  // ensure service-account-samplermj.json is gitignored
  const serviceAccount = require('../../service-account-samplermj.json');
  appConfig = {
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
  console.log('⚙️  Firebase Admin config set for LOCAL mode');
} else {
  // ─── PRODUCTION: rely on built-in credentials ──────────────────────
  appConfig = {
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
  console.log('🔒 Firebase Admin config set for PRODUCTION mode');
}

// Only initialize once:
const app = !admin.apps.length
  ? admin.initializeApp(appConfig)
  : admin.app();

const db      = admin.firestore();
const auth    = getAuth();
const storage = getStorage();

export { db, auth, storage, admin };
