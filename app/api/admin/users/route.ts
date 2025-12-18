import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"
import { logAdminAction } from "@/lib/logger"

async function checkAdmin(request: Request) {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "admin") return null
    return user
}

export async function GET(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const listUsersResult = await adminAuth.listUsers(1000)
        const authUsers = listUsersResult.users

        const userDocsSnapshot = await adminDb.collection("users").get()
        const firestoreUsersMap: Record<string, any> = {}
        userDocsSnapshot.forEach((doc) => {
            firestoreUsersMap[doc.id] = doc.data()
        })

        const users = authUsers.map((authUser) => {
            const firestoreData = firestoreUsersMap[authUser.uid] || {}
            let status = firestoreData.status || "active"
            if (authUser.disabled) status = "suspended"

            return {
                id: authUser.uid,
                uid: authUser.uid,
                name: authUser.displayName || firestoreData.name || firestoreData.displayName || "Guest User",
                email: authUser.email || firestoreData.email || "No Email",
                avatar: authUser.photoURL || firestoreData.photoURL || "",
                role: firestoreData.role || "user",
                status: status,
                tier: firestoreData.tier || firestoreData.plan || "free",
                registrationDate: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).toLocaleDateString() : "Unknown",
                lastLogin: authUser.metadata.lastSignInTime ? new Date(authUser.metadata.lastSignInTime).toLocaleDateString() : "Never",
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Admin Users GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const { uid, ...userData } = await request.json()
        if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 })

        await adminDb.collection("users").doc(uid).set(userData, { merge: true })

        if (userData.status === "suspended") {
            await adminAuth.updateUser(uid, { disabled: true })
        } else if (userData.status === "active" || userData.status === "premium") {
            await adminAuth.updateUser(uid, { disabled: false })
        }

        await logAdminAction(admin.uid as string, admin.email as string, "UPDATE", "USER", `Updated user ${uid}`, uid)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin Users PUT Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get("uid")
        if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 })

        await adminAuth.deleteUser(uid)
        await adminDb.collection("users").doc(uid).delete()

        await logAdminAction(admin.uid as string, admin.email as string, "DELETE", "USER", `Deleted user ${uid}`, uid)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin Users DELETE Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
