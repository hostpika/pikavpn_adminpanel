import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";

export async function GET() {
    try {
        const docRef = adminFirestore.collection("config").doc("general");
        const doc = await docRef.get();

        if (!doc.exists) {
            // Return default config if not found, or maybe empty object to let frontend use defaults
            return NextResponse.json({});
        }

        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("Error fetching config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // We expect the body to contain the config sections (features, vpn, etc.)
        // We'll merge it into the existing document
        const docRef = adminFirestore.collection("config").doc("general");

        await docRef.set({
            ...body,
            updatedAt: new Date().toISOString(),
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
