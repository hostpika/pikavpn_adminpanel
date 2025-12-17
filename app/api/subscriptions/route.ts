import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";
import { getAdminFromRequest } from "@/lib/auth-helper";
import { logAdminAction } from "@/lib/logger";

export async function GET() {
    try {
        const plansRef = adminFirestore.collection("plans");
        const snapshot = await plansRef.get();
        const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.price || !body.googleProductId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const planData = {
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: body.isActive ?? true, // Default to true if not provided
        };

        const res = await adminFirestore.collection("plans").add(planData);

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "CREATE", "SUBSCRIPTION", `Created plan ${body.name}`, res.id, body.name, planData);

        return NextResponse.json({ id: res.id, ...planData }, { status: 201 });
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing Plan ID" }, { status: 400 });
        }

        await adminFirestore.collection("plans").doc(id).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "UPDATE", "SUBSCRIPTION", `Updated plan ${data.name || id}`, id, data.name || id, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing Plan ID" }, { status: 400 });
        }

        await adminFirestore.collection("plans").doc(id).delete();

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "DELETE", "SUBSCRIPTION", `Deleted plan ${id}`, id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
