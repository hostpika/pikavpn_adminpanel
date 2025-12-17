import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const action = searchParams.get("action");
        const adminEmail = searchParams.get("admin");
        const fromDate = searchParams.get("from");
        const toDate = searchParams.get("to");

        let query = adminFirestore.collection("activity_logs").orderBy("timestamp", "desc");

        if (action && action !== "all") {
            query = query.where("action", "==", action);
        }

        if (adminEmail && adminEmail !== "all") { // Simple filter by string email match
            query = query.where("adminEmail", "==", adminEmail);
        }

        if (fromDate) {
            const start = new Date(fromDate);
            query = query.where("timestamp", ">=", start);
        }

        if (toDate) {
            const end = new Date(toDate);
            // Add one day to include the end date fully
            end.setDate(end.getDate() + 1);
            query = query.where("timestamp", "<=", end);
        }

        const snapshot = await query.limit(limit).get();

        const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert timestamp to ISO string for generic JSON response
                timestamp: data.timestamp?.toDate().toISOString()
            };
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
