import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"

export async function GET() {
    try {
        const doc = await adminDb.collection("config").doc("more_apps").get()
        const data = doc.exists ? doc.data() : { apps: [] }

        // If config doesn't exist yet, return a sensible default structure (empty list)
        // rather than dummy placeholder data, to satisfy "remove dummy values" requirement.
        return NextResponse.json(data)
    } catch (error) {
        console.error("More Apps API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
