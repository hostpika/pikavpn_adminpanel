import { verifyToken } from "@/lib/internal/auth";

export async function getAdminFromRequest(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split("Bearer ")[1];
    try {
        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return null;
        }

        return {
            uid: payload.uid as string,
            email: payload.email as string || "unknown@admin.com",
            role: payload.role as string
        };
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
