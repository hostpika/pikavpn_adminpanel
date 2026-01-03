import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"

export async function GET(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        if (!user || !user.uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userDoc = await adminDb.collection("users").doc(user.uid as string).get()

        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userData = userDoc.data()

        // Filter and return only safe public profile data
        const profile = {
            uid: userData?.uid,
            email: userData?.email,
            displayName: userData?.displayName,
            plan: userData?.plan || "free",
            status: userData?.status || "active",
            // Return expiry if available, otherwise null or calculate based on plan logic
            expiresAt: userData?.expiresAt || null,
            createdAt: userData?.createdAt,
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


export async function DELETE(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        if (!user || !user.uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Soft delete: Update status to 'deleted'
        await adminDb.collection("users").doc(user.uid as string).update({
            status: "deleted",
            deletedAt: new Date().toISOString()
        })

        // We do NOT delete from Firebase Auth to maintain the record as requested.
        // The client should handle sign-out.

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
