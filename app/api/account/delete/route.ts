
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/internal/firebase";
import { sendUserStatusEmail } from "@/lib/email-service";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (e) {
            console.error("Token verification failed:", e);
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const uid = decodedToken.uid;
        const email = decodedToken.email;

        if (!uid) {
            return NextResponse.json({ error: "User identity missing" }, { status: 400 });
        }

        // 1. Soft Delete in Firestore
        const userRef = adminDb.collection("users").doc(uid);
        await userRef.set(
            {
                status: "deleted",
                deletedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        // 2. Disable in Firebase Auth (Prevent future logins)
        await adminAuth.updateUser(uid, {
            disabled: true,
        });

        // 3. Send Notification Email
        if (email) {
            // Fetch latest name if possible, or use token claim
            let displayName = decodedToken.name || "User";
            try {
                const userRecord = await adminAuth.getUser(uid);
                if (userRecord.displayName) displayName = userRecord.displayName;
            } catch (e) {
                // Ignore
            }

            await sendUserStatusEmail(email, {
                username: displayName,
                scenario: "account_deleted",
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Account Deletion Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
