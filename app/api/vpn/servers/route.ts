import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"

export async function GET(request: Request) {
    try {
        const user = await getUserFromRequest(request)
        const userPlan = (user?.plan as string) || "free"

        const serversRef = adminDb.collection("servers")
        const snapshot = await serversRef.where("enabled", "==", true).get()

        const servers = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((server: any) => {
                // If user is guest/free, only show free servers
                if (userPlan === "free") {
                    return server.tier === "free"
                }
                // Premium users see everything
                return true
            })
            .map((server: any) => ({
                id: server.id,
                country: server.country || server.name?.split("-")[0] || "Unknown",
                city: server.city || "Various",
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
