import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getUserFromRequest } from "@/lib/internal/permissions"
import { logAdminAction } from "@/lib/logger"

async function checkAdmin(request: Request) {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "admin") return null
    return user
}

const DOC_KEYS = ["features", "vpn", "ui", "ads", "version"]

export async function GET(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const configCollection = adminDb.collection("config")
        const docs = await Promise.all(DOC_KEYS.map((key) => configCollection.doc(key).get()))

        const fullConfig: any = {}
        docs.forEach((doc, index) => {
            if (doc.exists) {
                fullConfig[DOC_KEYS[index]] = doc.data()
            }
        })

        return NextResponse.json(fullConfig)
    } catch (error) {
        console.error("Admin Config GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const admin = await checkAdmin(request)
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    try {
        const body = await request.json()
        const configCollection = adminDb.collection("config")
        const batch = adminDb.batch()

        for (const key of Object.keys(body)) {
            if (DOC_KEYS.includes(key)) {
                const docRef = configCollection.doc(key)
                batch.set(
                    docRef,
                    {
                        ...body[key],
                        updatedAt: new Date().toISOString(),
                    },
                    { merge: true }
                )
            }
        }

        await batch.commit()
        await logAdminAction(admin.uid as string, admin.email as string, "UPDATE", "CONFIG", "Updated system configuration")

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin Config POST Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
