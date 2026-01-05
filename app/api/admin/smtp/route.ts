import { NextResponse } from "next/server";
import { adminDb } from "@/lib/internal/firebase";
import { getAdminFromRequest } from "@/lib/auth-helper";

export async function GET(request: Request) {
    try {
        const isAdmin = await getAdminFromRequest(request);

        const doc = await adminDb.collection("settings").doc("smtp").get();
        if (!doc.exists) {
            return NextResponse.json({});
        }

        const data = doc.data() || {};

        if (!isAdmin) {
            // Mask sensitive data for non-admins
            return NextResponse.json({
                host: data.host,
                port: data.port,
                username: data.username ? "********" : "",
                password: data.password ? "********" : "", // Mask password
                encryption: data.encryption,
                fromEmail: data.fromEmail,
                fromName: data.fromName,
                isConfigured: true // Flag to let UI know config exists
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching SMTP config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const isAdmin = await getAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { host, port, username, password, encryption, fromEmail, fromName } = body;

        // Basic validation
        if (!host || !port || !fromEmail) {
            return NextResponse.json({ error: "Host, Port, and From Email are required" }, { status: 400 });
        }

        const dataToSave = {
            host,
            port,
            username: username || "",
            password: password || "",
            encryption: encryption || "none",
            fromEmail,
            fromName: fromName || "",
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection("settings").doc("smtp").set(dataToSave);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving SMTP config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const isAdmin = await getAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await adminDb.collection("settings").doc("smtp").delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting SMTP config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
