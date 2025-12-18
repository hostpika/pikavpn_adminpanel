import { NextResponse } from "next/server";
import { adminDb } from "@/lib/internal/firebase";
import { getAdminFromRequest } from "@/lib/auth-helper";

export async function GET(request: Request) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const action = searchParams.get("action");
        const adminEmail = searchParams.get("admin");
        const fromDate = searchParams.get("from");
        const toDate = searchParams.get("to");
        const lastTimestamp = searchParams.get("lastTimestamp");

        let query = adminDb.collection("activity_logs").orderBy("timestamp", "desc");

        if (action && action !== "all") {
            query = query.where("action", "==", action);
        }

        if (adminEmail && adminEmail !== "all") {
            query = query.where("adminEmail", "==", adminEmail);
        }

        if (fromDate) {
            const start = new Date(fromDate);
            query = query.where("timestamp", ">=", start);
        }

        if (toDate) {
            const end = new Date(toDate);
            end.setDate(end.getDate() + 1);
            query = query.where("timestamp", "<=", end);
        }

        if (lastTimestamp) {
            // Firestore requires a Date object for Timestamp fields in startAfter
            query = query.startAfter(new Date(lastTimestamp));
        }

        // Fetch limit + 1 to check if there are more
        const snapshot = await query.limit(limit + 1).get();
        const rawDocs = snapshot.docs;
        const hasMore = rawDocs.length > limit;

        // If hasMore, remove the extra doc
        const docs = hasMore ? rawDocs.slice(0, limit) : rawDocs;

        const logs = docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate().toISOString()
            };
        });

        const lastDoc = docs[docs.length - 1];
        const nextCursor = hasMore && lastDoc ? lastDoc.data().timestamp?.toDate().toISOString() : null;

        return NextResponse.json({ logs, nextCursor, hasMore });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
