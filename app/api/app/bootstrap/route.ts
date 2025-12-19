import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"

export async function GET() {
    try {
        const configCollection = adminDb.collection("config")

        // Fetch relevant docs for bootstrap
        const [featuresDoc, versionDoc] = await Promise.all([
            configCollection.doc("features").get(),
            configCollection.doc("version").get(),
        ])

        const featuresData = featuresDoc.exists ? featuresDoc.data() : { freeVpn: true, premiumVpn: false }

        // Remove ads from features as it has its own endpoint
        const { ads, ...features } = featuresData as any
        const version = versionDoc.exists ? versionDoc.data() : { forceUpdate: false, message: null }

        return NextResponse.json({
            features,
            min_version: version?.minVersion || "1.0.0",
            cache_version: version?.cacheVersion || 1,
            maintenance_mode: version?.maintenanceMode || false,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("Bootstrap API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
