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
                    // Fetch additional details from Firestore
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
                    const userData = userDoc.data()

                    const appUser: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "Admin User",
                        photoURL: firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
                        phoneNumber: userData?.phoneNumber || "",
                        bio: userData?.bio || "",
                        location: userData?.location || "",
                        role: userData?.role || "user"
                    }
                    setUser(appUser)
                } catch (error) {
                    console.error("Error fetching user details", error)
                    // Fallback to basic auth user if Firestore fails
                    const appUser: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "Admin User",
                        photoURL: firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
                        role: "user"
                    }
                    setUser(appUser)
                }
            } else {
                setUser(null)
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
