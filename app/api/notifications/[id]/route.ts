import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
        }

        await adminFirestore.collection("notifications").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
