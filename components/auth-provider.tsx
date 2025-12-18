"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, ActivityLog } from "@/lib/auth-service"
import { authService } from "@/lib/auth-service"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
    updateProfile: (data: Partial<User>) => Promise<void>
    updatePassword: (current: string, newPass: string) => Promise<void>
    getRecentActivity: () => Promise<ActivityLog[]>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
    updatePassword: async () => { },
    getRecentActivity: async () => [],
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Phase 1 Secure Architecture: Exchange Firebase ID Token for Backend JWT
                    const idToken = await firebaseUser.getIdToken()
                    const response = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ firebaseIdToken: idToken }),
                    })

                    if (!response.ok) throw new Error("Backend login failed")

                    const { accessToken } = await response.json()
                    localStorage.setItem("backend_token", accessToken)

                    // Decode token or fetch user from backend (for now manually set from firebase info)
                    // In a more robust implementation, we'd fetch the full user profile from /api/admin/profile or similar
                    // But for now, we'll use the Firebase user info and assume the backend handled verification.
                    const appUser: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "Admin User",
                        photoURL: firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
                        role: "admin" // For the admin panel, we assume the user logged in is an admin
                    }
                    setUser(appUser)
                } catch (error) {
                    console.error("Error during backend authentication", error)
                    setUser(null)
                    localStorage.removeItem("backend_token")
                }
            } else {
                setUser(null)
                localStorage.removeItem("backend_token")
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signOut = async () => {
        await authService.signOut()
        setUser(null)
        router.push("/login")
    }

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return
        await authService.updateUseProfile(user.uid, data)
        // Optimistic update of local state
        setUser(prev => prev ? { ...prev, ...data } : null)
    }

    const updatePassword = async (current: string, newPass: string) => {
        await authService.updateUserPassword(current, newPass)
    }

    const getRecentActivity = async () => {
        if (!user) return []
        return await authService.getRecentActivity(user.uid)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut, updateProfile, updatePassword, getRecentActivity }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
