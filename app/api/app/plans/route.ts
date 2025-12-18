import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"

export async function GET(request: Request) {
    try {
        // Fetch only active plans for the mobile app
        const snapshot = await adminDb.collection("plans")
            .where("isActive", "==", true)
            .get()

        const plans = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                name: data.name,
                price: data.price,
                currency: data.currency,
                interval: data.interval,
                googleProductId: data.googleProductId,
                features: data.features,
                popular: data.popular
            }
        })

        return NextResponse.json({ plans })
    } catch (error) {
        console.error("Error fetching app plans:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
