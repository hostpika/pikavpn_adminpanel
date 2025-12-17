import { auth } from "@/lib/firebase";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
