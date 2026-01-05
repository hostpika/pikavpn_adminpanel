import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/internal/permissions"

// Basic In-Memory Rate Limiter (Placeholder for Phase 1)
// In production, use Redis or a proper middleware
// In-memory store for session rate limiting
// In production, this should be Redis or a similar persistent store
const sessionLimits = new Map<string, { count: number; lastReset: number }>()

export async function checkRateLimit(request: Request) {
    const user = await getUserFromRequest(request)
    const role = (user?.role as string) || "anonymous"
    const plan = (user?.plan as string) || "free"
    const id = (user?.uid as string) || `anon_${request.headers.get("x-forwarded-for") || "unknown"}`

    // 1. Define Tiered Limits (Rolling 24h Window)
    let limit = 5; // Default for anonymous
    if (role === "user") {
        limit = plan === "premium" ? 1000 : 15; // Premium effectively unlimited, Free limited to 15
    } else if (role === "admin") {
        return true; // No limits for admins
    }

    const windowMs = 24 * 60 * 60 * 1000 // 24 hour window
    const now = Date.now()
    const current = sessionLimits.get(id) || { count: 0, lastReset: now }

    if (now - current.lastReset > windowMs) {
        current.count = 0
        current.lastReset = now
    }

    current.count++
    sessionLimits.set(id, current)

    return current.count <= limit
}

export function rateLimitResponse() {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
