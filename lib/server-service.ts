import { fetchWithAuth } from "@/lib/api-client"

export interface ServerData {
  id?: string
  name: string
  country: string
  flag: string
  ip: string
  port: number
  protocol: string
  tier: "free" | "premium"
  maxCapacity: number
  streaming: boolean
  p2p: boolean
  notes: string
  ovpnFileUrl?: string
  ovpnFilePath?: string
  status: "online" | "offline" | "maintenance"
  isActive: boolean
  username: string
  password: string
  load: number
  currentUsers: number
  createdAt: Date
  updatedAt: Date
  // Add base64 fields for API upload
  ovpnFileContent?: string
  ovpnFileName?: string
}

export async function addServer(serverData: Omit<ServerData, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const response = await fetchWithAuth("/api/admin/servers", {
    method: "POST",
    body: JSON.stringify(serverData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to add server")
  }

  const data = await response.json()
  return data.id
}

export async function updateServer(id: string, serverData: Partial<ServerData>): Promise<void> {
  const response = await fetchWithAuth("/api/admin/servers", {
    method: "PUT",
    body: JSON.stringify({ id, ...serverData }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update server")
  }
}

export async function deleteServer(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/admin/servers?id=${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete server")
  }
}

export async function getServers(): Promise<ServerData[]> {
  const response = await fetchWithAuth("/api/admin/servers")

  if (!response.ok) {
    throw new Error("Failed to fetch servers")
  }

  return response.json()
}

export async function getServer(id: string): Promise<ServerData | null> {
  // Optimization: we could add a single server endpoint
  const response = await fetchWithAuth(`/api/admin/servers?id=${id}`) // Assuming GET with ID might work or we fetch all
  // For now, let's keep it simple and fetch all then find, as we did before
  const servers = await getServers()
  return servers.find(s => s.id === id) || null
}

// Get country flag emoji from country name
import { COUNTRIES } from "@/lib/countries"

export function getCountryFlag(country: string): string {
  const found = COUNTRIES.find(c => c.name === country)
  return found?.flag || "🌐"
}

// Helper to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1]
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })
}
