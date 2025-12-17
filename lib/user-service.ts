export interface UserData {
  id?: string
  uid?: string
  email: string
  name: string
  avatar?: string
  status: "active" | "trial" | "premium" | "suspended"
  tier: "free" | "basic" | "premium"
  registrationDate: string
  lastLogin: string
  totalConnectionTime: string
  dataTransferred: string
  deviceCount: number
  createdAt: Date
  updatedAt: Date
}

export async function getUsers(): Promise<UserData[]> {
  const response = await fetch("/api/users")

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  const data = await response.json()
  return data.users
}

export async function getUser(id: string): Promise<UserData | null> {
  // Currently fetching all users and filtering, as we don't have a single-user API yet
  // Optimization: specific endpoint /api/users/[id]
  const users = await getUsers()
  return users.find(u => u.id === id) || null
}

export async function updateUser(id: string, userData: Partial<UserData>): Promise<void> {
  const response = await fetch("/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid: id, ...userData }),
  })

  if (!response.ok) {
    throw new Error("Failed to update user")
  }
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users?uid=${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }
}

export async function getUsersByStatus(status: string): Promise<UserData[]> {
  const users = await getUsers()
  return users.filter(u => u.status === status)
}

export async function getUserStats() {
  const users = await getUsers()

  return {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    premium: users.filter((u) => u.status === "premium").length,
    trial: users.filter((u) => u.status === "trial").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }
}
