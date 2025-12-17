import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const pageToken = searchParams.get("pageToken") || undefined;

        const listUsersResult = await adminAuth.listUsers(limit, pageToken);

        return NextResponse.json({
            users: listUsersResult.users,
            nextPageToken: listUsersResult.pageToken,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Example POST for privileged actions like creating a user or setting claims
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role } = body;

        const userRecord = await adminAuth.createUser({
            email,
            password,
        });

        if (role) {
            await adminAuth.setCustomUserClaims(userRecord.uid, { role });
        }

        return NextResponse.json({ user: userRecord }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Update user (e.g. suspend, grant premium, disable)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { uid, status, role, disabled } = body;

        if (!uid) {
            return NextResponse.json({ error: "Missing User UID" }, { status: 400 });
        }

        const updates: any = {};
        if (disabled !== undefined) {
            updates.disabled = disabled;
        }

        // Update Auth profile if needed
        if (Object.keys(updates).length > 0) {
            await adminAuth.updateUser(uid, updates);
        }

        // Update Custom Claims if role/status changes (simplified logic)
        if (role || status) {
            const currentClaims = (await adminAuth.getUser(uid)).customClaims || {};
            await adminAuth.setCustomUserClaims(uid, { ...currentClaims, role, status });
        }

        // Also update Firestore user document for searching/filtering
        // note: In a real production app, you might listen to Auth triggers to sync this
        const userRef = adminFirestore.collection("users").doc(uid);
        await userRef.set({ ...body, updatedAt: new Date().toISOString() }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json({ error: "Missing User UID" }, { status: 400 });
        }

        await adminAuth.deleteUser(uid);
        await adminFirestore.collection("users").doc(uid).delete();

        return NextResponse.json({ success: true, uid });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
