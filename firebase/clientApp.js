import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth'
//FOR DEVELOPMENT//
// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };
//FOR DEPLOYMENT//
const firebaseConfig = {
    apiKey: "AIzaSyC1oPK69XInlpw-E9BowLGocFq2i8wRjZA",
    authDomain: "real-motor-japan.firebaseapp.com",
    projectId: "real-motor-japan",
    storageBucket: "real-motor-japan.firebasestorage.app",
    messagingSenderId: "854100669672",
    appId: "1:854100669672:web:c224be87d85439b5af855d",
    measurementId: "G-SS7WCX5ZMV"
};


// Ensure the Firebase app is initialized only once
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp)
export { firebaseApp, firestore, storage, auth };

