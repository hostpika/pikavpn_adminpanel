import { auth } from "@/lib/firebase";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    // Use backend token if available (Phase 1 Secure Architecture)
    const backendToken = typeof window !== "undefined" ? localStorage.getItem("backend_token") : null;

    if (backendToken) {
        headers["Authorization"] = `Bearer ${backendToken}`;
    } else if (auth.currentUser) {
        // Fallback or Initial Auth for /api/auth/login
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
