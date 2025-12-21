import { NextResponse } from "next/server";
import { adminDb } from "@/lib/internal/firebase";
import { getAdminFromRequest } from "@/lib/auth-helper";

export async function POST(request: Request) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { app } = body; // Expecting { app: AppType }

        if (!app || !app.id) {
            return NextResponse.json({ error: "Invalid app data" }, { status: 400 });
        }

        const docRef = adminDb.collection("config").doc("more_apps");
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : { apps: [] };
        const updatedApps = [...(currentData?.apps || []), app];

        await docRef.set({ apps: updatedApps }, { merge: true });

        // Log action
        await adminDb.collection("activity_logs").add({
            action: "Added App",
            details: `Added ${app.name} to More Apps`,
            timestamp: new Date(),
            adminEmail: admin.email
        });

        return NextResponse.json({ success: true, apps: updatedApps });
    } catch (error) {
        console.error("Error adding app:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { app } = body;

        if (!app || !app.id) {
            return NextResponse.json({ error: "Invalid app data" }, { status: 400 });
        }

        const docRef = adminDb.collection("config").doc("more_apps");
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : { apps: [] };

        const updatedApps = (currentData?.apps || []).map((a: any) => a.id === app.id ? app : a);

        await docRef.set({ apps: updatedApps }, { merge: true });

        // Log action
        await adminDb.collection("activity_logs").add({
            action: "Updated App",
            details: `Updated info for ${app.name}`,
            timestamp: new Date(),
            adminEmail: admin.email
        });

        return NextResponse.json({ success: true, apps: updatedApps });
    } catch (error) {
        console.error("Error updating app:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const docRef = adminDb.collection("config").doc("more_apps");
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : { apps: [] };

        const updatedApps = (currentData?.apps || []).filter((a: any) => a.id !== id);

        await docRef.set({ apps: updatedApps }, { merge: true });

        // Log action
        await adminDb.collection("activity_logs").add({
            action: "Deleted App",
            details: `Removed app ID ${id}`,
            timestamp: new Date(),
            adminEmail: admin.email
        });

        return NextResponse.json({ success: true, apps: updatedApps });
    } catch (error) {
        console.error("Error deleting app:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
