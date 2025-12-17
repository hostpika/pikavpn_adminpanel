import { NextResponse } from "next/server";
import { adminFirestore, adminStorage } from "@/lib/firebase/admin";
import { getAdminFromRequest } from "@/lib/auth-helper";
import { logAdminAction } from "@/lib/logger";

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

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "CREATE", "SERVER", `Created server ${body.name || "Unknown"}`, res.id, body);

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

        const admin = await getAdminFromRequest(request);
        const targetName = data.name || (await adminFirestore.collection("servers").doc(id).get()).data()?.name || id;
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "UPDATE", "SERVER", `Updated server ${targetName}`, id, targetName, data);

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

        const serverDoc = await adminFirestore.collection("servers").doc(id).get();
        const targetName = serverDoc.data()?.name || id;

        // Delete associated OVPN file from Storage bucket if exists
        const serverData = serverDoc.data();
        if (serverData?.ovpnFileUrl) {
            try {
                // Format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media...
                const matches = serverData.ovpnFileUrl.match(/\/o\/(.+?)\?/);
                if (matches && matches[1]) {
                    const filePath = decodeURIComponent(matches[1]);
                    await adminStorage.bucket().file(filePath).delete();
                    console.log(`[API/Servers] Deleted OVPN file for ${id}: ${filePath}`);
                }
            } catch (storageError) {
                // Ignore if file doesn't exist or permission error, but log it
                console.warn(`[API/Servers] Could not delete OVPN file for ${id}:`, storageError);
            }
        }

        await adminFirestore.collection("servers").doc(id).delete();

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "DELETE", "SERVER", `Deleted server ${targetName}`, id, targetName);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error deleting server:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
