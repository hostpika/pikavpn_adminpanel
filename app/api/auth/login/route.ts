import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/internal/firebase"
import { createToken } from "@/lib/internal/auth"

export async function POST(request: Request) {
    try {
        const { firebaseIdToken } = await request.json()

        if (!firebaseIdToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
        }

        // Verify the Firebase ID token
        const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken)
        const uid = decodedToken.uid

        // Fetch or create user record in Firestore
        const userDoc = await adminDb.collection("users").doc(uid).get()
        let userData = userDoc.data()

        // Detect if this is an anonymous login
        const isAnonymous = decodedToken.firebase?.sign_in_provider === 'anonymous'

        if (!userDoc.exists) {
            // Initializing new user record
            userData = {
                uid,
                email: decodedToken.email || "",
                displayName: decodedToken.name || (isAnonymous ? "Anonymous User" : "Guest User"),
                role: isAnonymous ? "anonymous" : "user",
                plan: "free",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            await adminDb.collection("users").doc(uid).set(userData)
        }

        // Issue backend JWT with standardized claims
        const payload = {
            uid,
            email: decodedToken.email,
            role: userData?.role || (isAnonymous ? "anonymous" : "user"),
            plan: userData?.plan || "free",
        }

        const accessToken = await createToken(payload)

        return NextResponse.json({
            accessToken,
            expiresIn: 3600, // Matching the signJWT expiration of 2h? Wait, spec says 3600
        })
    } catch (error) {
        console.error("Login API Error:", error)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
}
