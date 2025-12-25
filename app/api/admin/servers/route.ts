import { NextResponse } from "next/server"
import { adminDb, adminStorage } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"
import { logAdminAction } from "@/lib/logger"

// Middleware-like check for admin
async function checkAdmin(request: Request) {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "admin") {
        return null
    }
    return user
}

export async function GET(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const serversRef = adminDb.collection("servers")
        const snapshot = await serversRef.get()
        const servers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        return NextResponse.json(servers)
    } catch (error) {
        console.error("Admin Servers GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const body = await request.json()
        const { ovpnFileContent, ovpnFileName, ...serverData } = body

        // 1. Create Server Record
        const serverRef = await adminDb.collection("servers").add({
            ...serverData,
            isActive: serverData.isActive ?? true, // Default to true using the correct field name
            tier: serverData.tier || "free",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })

        const serverId = serverRef.id

        // 2. Handle OVPN File Upload (Backend mediated)
        if (ovpnFileContent && ovpnFileName) {
            const bucket = adminStorage.bucket()
            const filePath = `ovpn-files/${serverId}/${ovpnFileName}`
            const file = bucket.file(filePath)

            // Convert base64 to buffer if it's sent as base64
            const buffer = Buffer.from(ovpnFileContent, "base64")
            await file.save(buffer, {
                metadata: { contentType: "application/x-openvpn-profile" }
            })

            // Get public URL or just store the path
            // Spec says "no OVPN URLs exposed", but admin might need it for management or we use paths internaly.
            // For Phase 1, we'll store the download URL for internal admin use if needed, but mobile won't see it.
            const [url] = await file.getSignedUrl({
                action: "read",
                expires: "03-01-2500", // "Forever" for now
            })

            await serverRef.update({ ovpnFileUrl: url, ovpnFilePath: filePath })
        }

        await logAdminAction(admin.uid as string, (admin.email as string) || "unknown", "CREATE", "SERVER", `Created server ${serverData.name}`, serverId)

        return NextResponse.json({ id: serverId }, { status: 201 })
    } catch (error) {
        console.error("Admin Servers POST Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const body = await request.json()
        const { id, ovpnFileContent, ovpnFileName, ...serverData } = body

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        const serverRef = adminDb.collection("servers").doc(id)

        // Update basic data
        await serverRef.update({
            ...serverData,
            updatedAt: new Date().toISOString(),
        })

        // Handle OVPN Update
        if (ovpnFileContent && ovpnFileName) {
            const bucket = adminStorage.bucket()
            const filePath = `ovpn-files/${id}/${ovpnFileName}`
            const file = bucket.file(filePath)

            const buffer = Buffer.from(ovpnFileContent, "base64")
            await file.save(buffer)

            const [url] = await file.getSignedUrl({
                action: "read",
                expires: "03-01-2500",
            })

            await serverRef.update({ ovpnFileUrl: url, ovpnFilePath: filePath })
        }

        await logAdminAction(admin.uid as string, (admin.email as string) || "unknown", "UPDATE", "SERVER", `Updated server ${id}`, id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin Servers PUT Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        const serverRef = adminDb.collection("servers").doc(id)
        const serverDoc = await serverRef.get()

        if (serverDoc.exists) {
            const data = serverDoc.data()
            if (data?.ovpnFilePath) {
                try {
                    await adminStorage.bucket().file(data.ovpnFilePath).delete()
                } catch (e) {
                    console.warn("Could not delete OVPN file from storage during server deletion", e)
                }
            }
        }

        await serverRef.delete()
        await logAdminAction(admin.uid as string, (admin.email as string) || "unknown", "DELETE", "SERVER", `Deleted server ${id}`, id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin Servers DELETE Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
