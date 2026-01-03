import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"

export async function POST(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { sessionId } = await request.json()
        if (!sessionId) {
            return NextResponse.json({ error: "Missing Session ID" }, { status: 400 })
        }

        const sessionRef = adminDb.collection("vpn_sessions").doc(sessionId)
        const sessionDoc = await sessionRef.get()

        if (!sessionDoc.exists) {
            return NextResponse.json({ error: "Session NOT found" }, { status: 404 })
        }

        const sessionData = sessionDoc.data()
        // Only owner or admin can revoke
        if (sessionData?.userId !== user.uid && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await sessionRef.update({ revoked: true })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("VPN Revoke Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
