import { NextResponse } from "next/server";
import { adminDb } from "@/lib/internal/firebase";

export async function GET(request: Request) {
    try {
        // Query for the most recent 'sent' notification
        const snapshot = await adminDb
            .collection("notifications")
            .where("status", "==", "sent")
            .orderBy("sentAt", "desc")
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ notification: null });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        const notification = {
            id: doc.id,
            title: data.title,
            message: data.message,
            image_url: data.image_url || null,
            cta_text: data.cta_text || null,
            cta_url: data.cta_url || null,
            dismissible: data.dismissible ?? true,
            min_version: data.min_version || null,
            max_version: data.max_version || null,
            priority: data.priority || "high",
        };

        return NextResponse.json({ notification });
    } catch (error) {
        console.error("Error fetching latest notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
