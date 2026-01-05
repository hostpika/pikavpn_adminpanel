import { auth, db } from "./firebase"
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  bio?: string
  location?: string
  role?: "admin" | "user"
}

export interface ActivityLog {
  id: string
  action: string
  details: string
  ip: string
  timestamp: Date
}

class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  private constructor() {
    if (typeof window !== "undefined") {
      // Initialize with stored state
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
      }

      // Listen for real auth changes
      onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user) {
          // Fetch additional details from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const userData = userDoc.data()

          const appUser: User = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "Admin User",
            photoURL: user.photoURL || "/placeholder.svg?height=40&width=40",
            phoneNumber: userData?.phoneNumber || "",
            bio: userData?.bio || "",
            location: userData?.location || "",
            role: userData?.role || "user"
          }
          this.currentUser = appUser
          localStorage.setItem("auth_user", JSON.stringify(appUser))
        } else {
          this.currentUser = null
          localStorage.removeItem("auth_user")
        }
      })
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Log simple sign in activity
      await this.logActivity(user.uid, "Login", "Successful login via directory")

      // Fetch or Initialize Firestore User Data
      return this.handleUserLogin(user)
    } catch (error: any) {
      // Only log unexpected errors
      if (error.code !== 'auth/wrong-password' && error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-credential') {
        console.error("Sign in failed", error)
      }
      throw error
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: "select_account"
      })

      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      // Log activity
      await this.logActivity(user.uid, "Login", "Successful login via Google")

      return this.handleUserLogin(user)
    } catch (error) {
      console.error("Google sign in failed", error)
      throw error
    }
  }

  private async handleUserLogin(user: FirebaseUser): Promise<User> {
    // Fetch or Initialize Firestore User Data
    const userRef = doc(db, "users", user.uid)
    let userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      // Create new user, default to 'user' role
      await setDoc(userRef, {
        email: user.email,
        role: "user",
        createdAt: serverTimestamp(),
        photoURL: user.photoURL // Store photoURL in Firestore too if desired, though auth profile is primary
      })
      userSnapshot = await getDoc(userRef)
    }
    const userData = userSnapshot.data()

    const appUser: User = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "/placeholder.svg?height=40&width=40",
      bio: userData?.bio || "",
      location: userData?.location || "",
      phoneNumber: userData?.phoneNumber || "",
      role: userData?.role || "user"
    }

    this.currentUser = appUser
    localStorage.setItem("auth_user", JSON.stringify(appUser))
    return appUser
  }

  async signOut(): Promise<void> {
    if (this.currentUser?.uid) {
      try {
        await this.logActivity(this.currentUser.uid, "Logout", "User signed out")
      } catch (e) {
        console.error("Failed to log logout", e)
      }
    }
    await firebaseSignOut(auth)
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
  }

  async updateUseProfile(uid: string, data: Partial<User>): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error("No authenticated user")

    // 1. Update Firebase Auth Profile (DisplayName/Photo)
    if (data.displayName || data.photoURL) {
      await firebaseUpdateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL
      })
    }

    // 2. Update Firestore Data (Bio, Location, Phone)
    const updates: any = {}
    if (data.bio !== undefined) updates.bio = data.bio
    if (data.location !== undefined) updates.location = data.location
    if (data.phoneNumber !== undefined) updates.phoneNumber = data.phoneNumber

    if (Object.keys(updates).length > 0) {
      await setDoc(doc(db, "users", uid), updates, { merge: true })
    }

    // 3. Log Activity
    await this.logActivity(uid, "Profile Update", "Updated account details")

    // 4. Update local state forcefully
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...data }
      localStorage.setItem("auth_user", JSON.stringify(this.currentUser))
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser
    if (!user || !user.email) throw new Error("No authenticated user")

    // Re-authenticate first
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    await firebaseUpdatePassword(user, newPassword)
    await this.logActivity(user.uid, "Security Update", "Changed account password")
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Failed to send password reset email", error)
      throw error
    }
  }

  async getRecentActivity(uid: string): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(db, `users/${uid}/activity`),
        orderBy("timestamp", "desc"),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        action: doc.data().action,
        details: doc.data().details,
        ip: doc.data().ip || "Unknown",
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      }))
    } catch (error) {
      console.error("Error fetching activity", error)
      return []
    }
  }

  private async logActivity(uid: string, action: string, details: string) {
    try {
      await addDoc(collection(db, `users/${uid}/activity`), {
        action,
        details,
        ip: "127.0.0.1", // In a real app, you'd get this from a backend function
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error("Failed to log activity", error)
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

export const authService = AuthService.getInstance()
