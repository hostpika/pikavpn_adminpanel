import { initializeApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
    // In development, we might not have these set if we're just checking types,
    // but for runtime they are critical.
    console.warn("Missing Firebase Admin credentials in environment variables.");
}

const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
};

// Singleton pattern to avoid multiple initializations
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket, // Configure storage bucket
    });
}

const adminFirestore = getFirestore();
const adminAuth = getAuth();
const adminMessaging = getMessaging();
const adminStorage = getStorage();

export { adminFirestore, adminAuth, adminMessaging, adminStorage };
