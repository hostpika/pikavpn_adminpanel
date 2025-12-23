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
        const currentPlan = userData?.plan || userData?.tier || "free"

        // 3. Fetch server data
        const serverDoc = await adminDb.collection("servers").doc(serverId).get()
        if (!serverDoc.exists) {
            return NextResponse.json({ error: "Server NOT found" }, { status: 404 })
        }

        const serverData = serverDoc.data()
        if (!serverData?.isActive) {
            return NextResponse.json({ error: "Server is disabled" }, { status: 403 })
        }

        // 4. Validate tier (DB Re-check)
        if (serverData.tier === "premium" && currentPlan !== "premium") {
            let hasTempAccess = false;

            // Check for specific server access
            const specificAccessId = `${user.uid}_${serverId}`;
            const specificAccessDoc = await adminDb.collection("temporary_access").doc(specificAccessId).get();

            if (specificAccessDoc.exists) {
                const data = specificAccessDoc.data();
                // Handle Firestore Timestamp or Date string
                const expiresAt = data?.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data?.expiresAt);
                if (expiresAt > new Date()) {
                    hasTempAccess = true;
                }
            }

            // Check for universal access (if applicable)
            if (!hasTempAccess) {
                const allAccessId = `${user.uid}_ALL`;
                const allAccessDoc = await adminDb.collection("temporary_access").doc(allAccessId).get();
                if (allAccessDoc.exists) {
                    const data = allAccessDoc.data();
                    const expiresAt = data?.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data?.expiresAt);
                    if (expiresAt > new Date()) {
                        hasTempAccess = true;
                    }
                }
            }

            if (!hasTempAccess) {
                return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
            }
        }

        // 3. Fetch OVPN template
        // Note: In Phase 1, we assume the ovpnFileUrl points to a file in Firebase Storage.
        // We should read the content directly from Storage.
        let ovpnConfig = ""
        if (serverData.ovpnFileUrl || serverData.ovpnFilePath) {
            try {
                // Extract file path from URL or use a dedicated field if available
                // For now, let's assume we can get the file from the bucket
                const bucket = adminStorage.bucket()

                if (serverData.ovpnFilePath) {
                    const [fileContent] = await bucket.file(serverData.ovpnFilePath).download()
                    ovpnConfig = fileContent.toString("utf-8")
                } else if (serverData.ovpnFileUrl) {
                    // Fallback to regex for legacy /o/ URLs
                    const matches = serverData.ovpnFileUrl.match(/\/o\/(.+?)\?/)
                    if (matches && matches[1]) {
                        const filePath = decodeURIComponent(matches[1])
                        const [fileContent] = await bucket.file(filePath).download()
                        ovpnConfig = fileContent.toString("utf-8")
                    } else {
                        // Final Fallback: Try fetching the URL directly (works for GCS signed URLs)
                        console.log("Attempting to fetch OVPN config directly from URL...");
                        const response = await fetch(serverData.ovpnFileUrl);
                        if (response.ok) {
                            ovpnConfig = await response.text();
                        } else {
                            console.error("Failed to fetch OVPN from URL. Status:", response.status);
                        }
                    }
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
            username: serverData.username || `u_${userId}_${sessionId}`,
            password: serverData.password || temporaryToken,
            expiresAt,
        })
    } catch (error) {
        console.error("VPN Session Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
