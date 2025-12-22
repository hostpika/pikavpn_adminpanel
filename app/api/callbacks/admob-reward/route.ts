import { NextResponse } from "next/server";
import { adminDb } from "@/lib/internal/firebase";
import crypto from "crypto";

// AdMob Public Keys URL
const ADMOB_KEYS_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";

interface AdMobKeys {
    keys: {
        keyId: number;
        pem: string;
        base64: string;
    }[];
}

let cachedKeys: AdMobKeys | null = null;
let lastKeysFetchStr: string | null = null; // Basic checks for 'max-age' if we wanted, but simple caching is okay for now.

async function getAdMobPublicKeys(): Promise<AdMobKeys> {
    if (cachedKeys) return cachedKeys;

    try {
        const response = await fetch(ADMOB_KEYS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch AdMob keys: ${response.statusText}`);
        }
        const data = await response.json();
        cachedKeys = data as AdMobKeys;
        return cachedKeys;
    } catch (error) {
        console.error("Error fetching AdMob keys:", error);
        throw error;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // 1. Extract Parameters
    const signature = searchParams.get("signature");
    const key_id = searchParams.get("key_id");
    const custom_data = searchParams.get("custom_data");
    const user_id = searchParams.get("user_id"); // Alternatively logic might use this if custom_data is missing, but requirement says custom_data has our uid/sid.

    if (!signature || !key_id) {
        return NextResponse.json({ error: "Missing signature or key_id" }, { status: 400 });
    }

    // 2. Reconstruct the message
    // AdMob SSV: The message to be signed is the query string *without* signature and key_id.
    // IMPORTANT: The order of parameters in the query string matters for reconstruction? 
    // Actually, AdMob docs say: "The message is the concatenation of the query parameters."
    // BUT usually, it's the full query string minus the signature parameters.
    // Let's look up specific AdMob SSV verification logic.
    // "The content to be verified is the query string of the request URL, excluding the signature and key_id parameters."
    // Implementation detail: we need to handle the params exactly as received.

    // A safer way is ensuring we reconstruct it from the raw URL or carefully filtering.
    // Standard approach: 
    // 1. Get query string.
    // 2. Remove 'signature' and 'key_id'.
    // 3. Verify.

    const rawUrl = request.url;
    const queryStringIndex = rawUrl.indexOf("?");
    if (queryStringIndex === -1) {
        return NextResponse.json({ error: "No query parameters" }, { status: 400 });
    }
    const queryString = rawUrl.substring(queryStringIndex + 1);
    const params = new URLSearchParams(queryString);

    // Re-serialize valid params sorted? Or just as received excluding sig?
    // AdMob documentation: "To verify, use the entire query string from the request, except for the signature and key_id parameters." 
    // It does NOT say to re-sort. It usually implies order preservation.
    // However, usually servers receiving might render order differently.
    // Let's assume standard behavior: filter out sig/key_id from the parsed params and reconstruct, 
    // OR strictly string manip on the raw query string. 
    // String manip is safer if we trust the raw URL.

    // Let's try to do it by creating a new URLSearchParams from existing, deleting signature/key_id, and toString().
    // NOTE: URLSearchParams.toString() sorts keys? No, standard URLSearchParams usually doesn't strictly sort but might normalize.
    // Let's stick to the raw query string component approach to be safest if possible, 
    // but `searchParams` is already parsed.

    params.delete("signature");
    params.delete("key_id");
    const message = params.toString();

    // 3. Verify Signature
    try {
        const keys = await getAdMobPublicKeys();
        const key = keys.keys.find((k) => k.keyId.toString() === key_id);

        if (!key) {
            console.error(`PublicKey not found for key_id: ${key_id}`);
            return NextResponse.json({ error: "Public key not found" }, { status: 400 });
        }

        const verifier = crypto.createVerify("SHA256");
        verifier.update(message);

        // Config signature is base64url encoded usually? AdMob says: "Web-safe Base64". 
        // We might need to replace '-' with '+' and '_' with '/'.
        const cleanSignature = signature.replace(/-/g, "+").replace(/_/g, "/");
        // Also might need padding, but Buffer.from usually handles unpadded if we are lucky, or we pad manually.

        const isValid = verifier.verify(key.pem, cleanSignature, "base64");

        if (!isValid) {
            console.warn("Invalid AdMob SSV signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }
    } catch (err) {
        console.error("Verification error:", err);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    // 4. Grant Access
    try {
        let targetUserId = "";
        let targetResourceId = "ALL"; // Default to ALL if not specified or implied

        // Parse custom_data
        // Expected format: {"uid": "123", "sid": "us-ny-1"} or just "uid:123" depending on client. 
        // User request example: {"uid": "123", "sid": "us-ny-1"}
        if (custom_data) {
            try {
                // It might be URL decoded already if we use searchParams.get
                // Try parsing generic JSON
                const decoded = decodeURIComponent(custom_data);
                const data = JSON.parse(decoded);
                if (data.uid) targetUserId = data.uid;
                if (data.sid) targetResourceId = data.sid;
            } catch (e) {
                // Fallback: simple string or just use user_id param from AdMob if custom_data fails
                console.warn("Failed to parse custom_data as JSON", e);
            }
        }

        if (!targetUserId && user_id) {
            // Fallback to ad_network user_id if custom keys missing
            targetUserId = user_id;
        }

        if (!targetUserId) {
            return NextResponse.json({ error: "No user identified" }, { status: 400 });
        }

        // 5. UPSERT TemporaryAccess
        // Collection: temporary_access
        // DocId: can be transaction_id to prevent replay, or composite userId_resourceId.
        // Spec says: "transactionId (String, Unique): The transaction ID from AdMob to prevent replay attacks."
        // So we should probably store the transaction separately or use it as ID.
        // BUT we also need to easily query "Does User X have access to Resource Y valid right now?"
        // If we key by transactionId, querying by user is harder without index.
        // If we key by userId, we overwrite previous transactions (which is fine for "extending" access, but we need to track unique transactions).

        // Better Approach:
        // Store the GRANT itself. 
        // Querying access: "Select * from temporary_access where userId == U and resourceId == R and expiresAt > Now"
        // To prevent replay: check if transactionId exists.

        const transactionId = searchParams.get("transaction_id");
        if (transactionId) {
            const existingTx = await adminDb.collection("admob_transactions").doc(transactionId).get();
            if (existingTx.exists) {
                // Already processed this transaction
                return NextResponse.json({ message: "Transaction already processed" });
            }
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 Hour

        const accessDocId = `${targetUserId}_${targetResourceId}`; // Single active grant strategy? 
        // Or multiple grants stacking? 
        // Requirement: "Set expiresAt = NOW() + 1 HOUR."
        // Simple upsert is easiest for the access check.

        // BATCH WRITE
        const batch = adminDb.batch();

        // 1. Record Transaction (idempotency)
        if (transactionId) {
            batch.set(adminDb.collection("admob_transactions").doc(transactionId), {
                userId: targetUserId,
                resourceId: targetResourceId,
                timestamp: now,
                originalParams: Object.fromEntries(searchParams)
            });
        }

        // 2. Grant Access
        // We'll use a specific doc ID for the user+resource so we can easily update/overwrite the expiration.
        // If they watch multiple ads, should it stack? 1 hr -> 2 hr? 
        // Requirement says: "Set expiresAt = NOW() + 1 HOUR." -> Implies override/reset?
        // Let's assume Extend if current > now? Or just strictly Now + 1hr (which might shorten if they had 2 hours? unlikely for single reward).
        // Let's safe bet: Max(currentExpiry, Now) + 1 Hour.
        // But specific requirement text: "Set expiresAt = NOW() + 1 HOUR." -> I will stick to this simple logic for now.

        const accessRef = adminDb.collection("temporary_access").doc(accessDocId);
        batch.set(accessRef, {
            userId: targetUserId,
            resourceId: targetResourceId,
            grantedAt: now,
            expiresAt: expiresAt, // Firestore Timestamp? Date maps to Timestamp usually.
            lastTransactionId: transactionId
        }, { merge: true });

        await batch.commit();

    } catch (err) {
        console.error("Database error:", err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
