import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"

export async function GET(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        const userPlan = (user?.plan as string) || "free"

        const serversRef = adminDb.collection("servers")
        const snapshot = await serversRef.where("isActive", "==", true).get()

        const servers = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            // Filter out inactive servers is handled by the initial query
            // We return ALL active servers so the client can show "locked" premium servers for upsell.
            .map((server: any) => ({
                id: server.id,
                country: server.country || "Unknown",
                city: server.name || "Unknown",
                tier: server.tier || "free",
                features: server.features || ["basic"],
                load: server.load || 0,
                latency: 100, // Dummy for now
            }))

        return NextResponse.json(servers)
    } catch (error) {
        console.error("Servers API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
