import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";

export async function GET() {
    try {
        const serversRef = adminFirestore.collection("servers");
        const snapshot = await serversRef.get();
        const servers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(servers);
    } catch (error) {
        console.error("Error fetching servers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // TODO: Add input validation (Zod) here

        const serversRef = adminFirestore.collection("servers");
        const res = await serversRef.add({
            ...body,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: res.id, ...body }, { status: 201 });
    } catch (error) {
        console.error("Error adding server:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing Server ID" }, { status: 400 });
        }

        const serverRef = adminFirestore.collection("servers").doc(id);
        await serverRef.update({
            ...data,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error updating server:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing Server ID" }, { status: 400 });
        }

        await adminFirestore.collection("servers").doc(id).delete();
        // Optional: Delete associated OVPN file from Storage bucket if needed

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error deleting server:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
