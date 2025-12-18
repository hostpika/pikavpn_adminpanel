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

        const features = featuresDoc.exists ? featuresDoc.data() : { freeVpn: true, premiumVpn: false }
        const version = versionDoc.exists ? versionDoc.data() : { forceUpdate: false, message: null }

        return NextResponse.json({
            features,
            forceUpdate: version?.forceUpdate || false,
            message: version?.message || null,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("Bootstrap API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
