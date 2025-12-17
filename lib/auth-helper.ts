import { adminAuth } from "@/lib/firebase/admin";

export async function getAdminFromRequest(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email || "unknown@admin.com",
            role: decodedToken.role || "admin" // Assuming custom claim or fallback
        };
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
