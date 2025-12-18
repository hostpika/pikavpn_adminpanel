import { NextResponse } from "next/server"
import { adminDb } from "@/lib/internal/firebase"
import { getAdminFromRequest } from "@/lib/auth-helper"

export async function GET(request: Request) {
    try {
        const admin = await getAdminFromRequest(request)
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const snapshot = await adminDb.collection("plans").get()
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        return NextResponse.json({ plans })
    } catch (error) {
        console.error("Error fetching subscriptions:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminFromRequest(request)
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()

        // Basic validation
        if (!data.name || !data.googleProductId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const newPlan = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        const docRef = await adminDb.collection("plans").add(newPlan)

        return NextResponse.json({ id: docRef.id, ...newPlan })
    } catch (error) {
        console.error("Error creating subscription:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const admin = await getAdminFromRequest(request)
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()
        const { id, ...updateData } = data

        if (!id) {
            return NextResponse.json({ error: "Missing Plan ID" }, { status: 400 })
        }

        await adminDb.collection("plans").doc(id).update({
            ...updateData,
            updatedAt: new Date().toISOString()
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating subscription:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const admin = await getAdminFromRequest(request)
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Missing Plan ID" }, { status: 400 })
        }

        await adminDb.collection("plans").doc(id).delete()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting subscription:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
