
import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";
import { getAdminFromRequest } from "@/lib/auth-helper";
import { logAdminAction } from "@/lib/logger";

export async function GET(request: Request) {
    try {
        // Fetch users from Firebase Authentication
        const listUsersResult = await adminAuth.listUsers(1000);
        const authUsers = listUsersResult.users;

        // Fetch user details from Firestore
        const userDocsSnapshot = await adminFirestore.collection("users").get();
        const firestoreUsersMap: Record<string, any> = {};
        userDocsSnapshot.forEach(doc => {
            firestoreUsersMap[doc.id] = doc.data();
        });

        // Merge Auth and Firestore data
        const users = authUsers.map(authUser => {
            const firestoreData = firestoreUsersMap[authUser.uid] || {};

            // Determine tier/status based on firestore data or defaults
            let status = firestoreData.status || "active";
            if (authUser.disabled) status = "suspended";

            return {
                id: authUser.uid,
                uid: authUser.uid,
                name: authUser.displayName || firestoreData.displayName || "Guest User",
                email: authUser.email || firestoreData.email || "No Email",
                avatar: authUser.photoURL || firestoreData.photoURL || "",
                role: firestoreData.role || "user",
                status: status,
                tier: firestoreData.plan || "free", // plan field from firestore
                registrationDate: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).toLocaleDateString() : "Unknown",
                lastLogin: authUser.metadata.lastSignInTime ? new Date(authUser.metadata.lastSignInTime).toLocaleDateString() : "Never",
                provider: authUser.providerData.length > 0 ? authUser.providerData[0].providerId : "anonymous",
                // Mock usage stats for now as they are not standard in Auth
                totalConnectionTime: firestoreData.totalConnectionTime || "0h 0m",
                dataTransferred: firestoreData.dataTransferred || "0 MB",
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { userId, action, payload } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const admin = await getAdminFromRequest(request);
        const adminId = admin?.uid || "system";
        const adminEmail = admin?.email || "system";

        let targetName = userId;
        try {
            const userRecord = await adminAuth.getUser(userId);
            targetName = userRecord.email || userRecord.displayName || userId;
        } catch (e) {
            console.warn("Could not fetch user info for logging", e);
        }

        console.log(`[API/Users] Action: ${action}, Admin: ${adminEmail} (${adminId})`);

        if (action === "ban") {
            await adminAuth.updateUser(userId, { disabled: true });
            await adminFirestore.collection("users").doc(userId).set({ status: "suspended" }, { merge: true });
            await logAdminAction(adminId, adminEmail, "BAN", "USER", `Banned user ${targetName}`, userId, targetName);
        } else if (action === "unban") {
            await adminAuth.updateUser(userId, { disabled: false });
            // Revert to active or previous status if known, defaulting to active
            await adminFirestore.collection("users").doc(userId).set({ status: "active" }, { merge: true });
            await logAdminAction(adminId, adminEmail, "UNBAN", "USER", `Unbanned user ${targetName}`, userId, targetName);
        } else if (action === "set_role") {
            // payload.role should be 'admin' or 'user'
            const newRole = payload?.role || "user";
            await adminAuth.setCustomUserClaims(userId, { role: newRole });
            await adminFirestore.collection("users").doc(userId).set({ role: newRole }, { merge: true });
            await logAdminAction(adminId, adminEmail, "SET_ROLE", "USER", `Changed role for ${targetName} to ${newRole}`, userId, targetName, { role: newRole });
        } else if (action === "set_plan") {
            // payload.plan should be 'premium' or 'free'
            const plan = payload?.plan || "free";
            await adminFirestore.collection("users").doc(userId).set({
                plan: plan,
                status: plan === "premium" ? "premium" : "active"
            }, { merge: true });
            await logAdminAction(adminId, adminEmail, "SET_PLAN", "USER", `Set plan for ${targetName} to ${plan}`, userId, targetName, { plan });
        }

        return NextResponse.json({ success: true, debug: { admin: adminEmail, id: adminId } });
    } catch (error) {
        console.error("Error updating user:", error);
        // Return clearer error message
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
