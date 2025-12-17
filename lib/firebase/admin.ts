import { initializeApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
        // databaseURL: \`https://\${projectId}.firebaseio.com\`, // Optional, for Realtime DB
    });
}

const adminFirestore = getFirestore();
const adminAuth = getAuth();
const adminMessaging = getMessaging();

export { adminFirestore, adminAuth, adminMessaging };
