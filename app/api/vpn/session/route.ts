import { NextResponse } from "next/server"
import { adminDb, adminStorage } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"
import { checkRateLimit, rateLimitResponse } from "@/lib/internal/rateLimit"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        const { serverId } = await request.json()

        if (!user || !user.uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!serverId) {
            return NextResponse.json({ error: "Missing Server ID" }, { status: 400 })
        }

        // 1. Mandatory Rate Limit Check
        const isAllowed = await checkRateLimit(request)
        if (!isAllowed) {
            return rateLimitResponse()
        }

        // 2. Fetch User Data (Source of Truth Re-check)
        const userDoc = await adminDb.collection("users").doc(user.uid as string).get()
        if (!userDoc.exists) {
            return NextResponse.json({ error: "User profile NOT found" }, { status: 404 })
        }
        const userData = userDoc.data()
        const currentPlan = userData?.plan || "free"

        // 3. Fetch server data
        const serverDoc = await adminDb.collection("servers").doc(serverId).get()
        if (!serverDoc.exists) {
            return NextResponse.json({ error: "Server NOT found" }, { status: 404 })
        }

        const serverData = serverDoc.data()
        if (!serverData?.enabled) {
            return NextResponse.json({ error: "Server is disabled" }, { status: 403 })
        }

        // 4. Validate tier (DB Re-check)
        if (serverData.tier === "premium" && currentPlan !== "premium") {
            return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
        }

        // 3. Fetch OVPN template
        // Note: In Phase 1, we assume the ovpnFileUrl points to a file in Firebase Storage.
        // We should read the content directly from Storage.
        let ovpnConfig = ""
        if (serverData.ovpnFileUrl) {
            try {
                // Extract file path from URL or use a dedicated field if available
                // For now, let's assume we can get the file from the bucket
                const bucket = adminStorage.bucket()
                // Simulating extraction since we don't have the exact path mapping yet
                // In a real scenario, you'd store the storage path directly.
                const matches = serverData.ovpnFileUrl.match(/\/o\/(.+?)\?/)
                if (matches && matches[1]) {
                    const filePath = decodeURIComponent(matches[1])
                    const [fileContent] = await bucket.file(filePath).download()
                    ovpnConfig = fileContent.toString("utf-8")
                }
            } catch (e) {
                console.error("Error downloading OVPN file:", e)
                return NextResponse.json({ error: "Could NOT fetch OVPN config" }, { status: 500 })
            }
        }

        if (!ovpnConfig) {
            return NextResponse.json({ error: "OVPN config NOT found for this server" }, { status: 500 })
        }

        // 4. Create Session
        const sessionId = `sess_${uuidv4().substring(0, 12)}`
        const userId = user?.uid || "anonymous"
        const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 hour session
        const temporaryToken = uuidv4().substring(0, 16)

        const sessionRecord = {
            sessionId,
            userId,
            serverId,
            expiresAt,
            revoked: false,
            createdAt: new Date().toISOString(),
        }

        await adminDb.collection("vpn_sessions").doc(sessionId).set(sessionRecord)

        // 5. Output
        return NextResponse.json({
            ovpnConfig,
            username: `u_${userId}_${sessionId}`,
            password: temporaryToken,
            expiresAt,
        })
    } catch (error) {
        console.error("VPN Session Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
