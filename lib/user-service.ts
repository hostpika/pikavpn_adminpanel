import { fetchWithAuth } from "@/lib/api-client"

export interface UserData {
  id?: string
  uid?: string
  email: string
  name: string
  avatar?: string
  status: "active" | "trial" | "premium" | "suspended"
  tier: "free" | "basic" | "premium" | "user"
  registrationDate: string
  lastLogin: string
  totalConnectionTime: string
  dataTransferred: string
  deviceCount: number
  createdAt: Date
  updatedAt: Date
  role?: string
}

export async function getUsers(): Promise<UserData[]> {
  const response = await fetchWithAuth("/api/admin/users")

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  const data = await response.json()
  return data.users
}

export async function getUser(id: string): Promise<UserData | null> {
  const users = await getUsers()
  return users.find(u => u.id === id) || null
}

export async function updateUser(id: string, userData: Partial<UserData>): Promise<void> {
  const response = await fetchWithAuth("/api/admin/users", {
    method: "PUT",
    body: JSON.stringify({ uid: id, ...userData }),
  })

  if (!response.ok) {
    throw new Error("Failed to update user")
  }
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/admin/users?uid=${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }
}

export async function getUserStats() {
  const users = await getUsers()

  return {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    premium: users.filter((u) => u.status === "premium" || u.tier === "premium").length,
    trial: users.filter((u) => u.status === "trial").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }
}
