import { verifyToken } from "@/lib/internal/auth"

export async function getUserFromRequest(request: Request) {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    const token = authHeader.split(" ")[1]
    return await verifyToken(token)
}
