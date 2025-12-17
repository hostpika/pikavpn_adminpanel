
import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";
import { getAdminFromRequest } from "@/lib/auth-helper";

export async function GET(request: Request) {
    try {
        const admin = await getAdminFromRequest(request);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doc = await adminFirestore.collection("users").doc(admin.uid).get();
        const data = doc.data();

        // Return preferences or defaults
        return NextResponse.json({
            preferences: data?.preferences || {}
        });
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminFromRequest(request);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { preferences } = body;

        if (!preferences) {
            return NextResponse.json({ error: "Missing preferences data" }, { status: 400 });
        }

        await adminFirestore.collection("users").doc(admin.uid).set({
            preferences: preferences
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving preferences:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
