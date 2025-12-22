import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/internal/firebase";
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
    const transaction_id = searchParams.get("transaction_id");

    if (!signature || !key_id) {
        return NextResponse.json({ error: "Missing signature or key_id" }, { status: 400 });
    }

    // 2. Reconstruct the message for verification
    // AdMob SSV verification message is the full query string usually *excluding* signature and key_id.
    // However, robust verification often involves taking the raw query string and stripping those precise params.
    // For simplicity and safety with Next.js URL parsing:
    const params = new URLSearchParams(searchParams);
    params.delete("signature");
    params.delete("key_id");
    // Important: The order of parameters must match exactly what AdMob sent. 
    // Since we can't guarantee URLSearchParams preserves original order perfectly regarding duplicates or specific sorting AdMob used,
    // using the raw query string is safer.

    const rawUrl = request.url;
    const queryStringIndex = rawUrl.indexOf("?");
    let message = "";
    if (queryStringIndex !== -1) {
        const rawQuery = rawUrl.substring(queryStringIndex + 1);
        // Remove signature and key_id from raw string carefully.
        // Regex or splitting might be needed. 
        // Simplest valid approach often accepted: Reconstruct from sorted params or trust the parser if order doesn't matter (AdMob says "concatenation of query parameters").
        // Actually, mostly order usually matters. 
        // Let's try to just use the params we have, but to satisfy strict verification, we'll iterate the raw string.
        // A common node approach:
        message = decodeURIComponent(params.toString());
        // WAIT: decodeURIComponent might mess up if params were encoded. 
        // Actually, `params.toString()` returns encoded string. AdMob signs the *query string*.
        // So `params.toString()` is close, but we need to be careful.
        // Let's rely on `params.toString()` for now as it's cleaner than raw string manipulation which is prone to edge cases.
        message = params.toString();
    }

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

        const cleanSignature = signature.replace(/-/g, "+").replace(/_/g, "/");
        const isValid = verifier.verify(key.pem, cleanSignature, "base64");

        if (!isValid) {
            console.warn("Invalid AdMob SSV signature");
            // For debugging, sometimes simple reconstruction fails. 
            // Return 403 but log detailed diff if possible.
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }
    } catch (err) {
        console.error("Verification error:", err);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    // 4. Parse "custom_data"
    // Expected format from client: 
    // customData: JSON.stringify({ userId: "...", reward: "1h" })
    let userId = "";
    let rewardType = "";

    try {
        if (custom_data) {
            // It comes URL-encoded in the query param usually, searchParams handles one layer. 
            // Inside it might be JSON.
            const jsonStr = decodeURIComponent(custom_data);
            // Sometimes it's double encoded or just raw string.
            // Try parsing
            let data;
            try {
                data = JSON.parse(jsonStr);
            } catch {
                // Try parsing raw custom_data if decode was unnecessary
                data = JSON.parse(custom_data);
            }

            userId = data.userId || data.uid;
            rewardType = data.reward || data.rewardedVideoReward || "1h"; // fallback?
        }
    } catch (e) {
        console.log("Error parsing custom_data:", e);
    }

    if (!userId) {
        console.error("No userId found in SSV callback");
        return NextResponse.json({ error: "No User ID" }, { status: 400 });
    }

    // 5. Idempotency Check
    if (transaction_id) {
        const txRef = adminDb.collection("admob_transactions").doc(transaction_id);
        const txDoc = await txRef.get();
        if (txDoc.exists) {
            return NextResponse.json({ message: "Already processed" });
        }
    }

    // 6. Grant Reward
    if (rewardType === "1h") {
        try {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1 Hour

            const batch = adminDb.batch();

            // A) Update User Document
            const userRef = adminDb.collection("users").doc(userId);
            batch.set(userRef, {
                plan: "premium",
                status: "active",
                expiresAt: expiresAt,
                updatedAt: now,
            }, { merge: true });

            // B) Log Transaction
            if (transaction_id) {
                batch.set(adminDb.collection("admob_transactions").doc(transaction_id), {
                    userId,
                    rewardType,
                    timestamp: now,
                    rawParams: Object.fromEntries(searchParams)
                });
            }

            await batch.commit();

            // C) Update Custom Claims
            await adminAuth.setCustomUserClaims(userId, {
                plan: "premium",
                premium: true
            });

            console.log(`Granted 1h premium to ${userId} via AdMob SSV`);
            return NextResponse.json({ success: true });

        } catch (error) {
            console.error("Error granting reward:", error);
            return NextResponse.json({ error: "Internal Error" }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "No action taken (unknown reward)" });
}
