import { storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

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
  status: "online" | "offline" | "maintenance"
  isActive: boolean
  username: string
  password: string
  load: number
  currentUsers: number
  createdAt: Date
  updatedAt: Date
}

export async function uploadOVPNFile(file: File, serverId: string): Promise<string> {
  const storageRef = ref(storage, `ovpn-files/${serverId}/${file.name}`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

export async function addServer(serverData: Omit<ServerData, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const response = await fetch("/api/servers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serverData),
  })

  if (!response.ok) {
    throw new Error("Failed to add server")
  }

  const data = await response.json()
  return data.id
}

export async function updateServer(id: string, serverData: Partial<ServerData>): Promise<void> {
  const response = await fetch("/api/servers", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...serverData }),
  })

  if (!response.ok) {
    throw new Error("Failed to update server")
  }
}

export async function deleteServer(id: string): Promise<void> {
  const response = await fetch(`/api/servers?id=${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete server")
  }
}

export async function getServers(): Promise<ServerData[]> {
  const response = await fetch("/api/servers")

  if (!response.ok) {
    throw new Error("Failed to fetch servers")
  }

  return response.json()
}

// Note: This relies on filtering client-side or getting single doc from API if added
export async function getServer(id: string): Promise<ServerData | null> {
  const servers = await getServers()
  return servers.find(s => s.id === id) || null
}

// Get country flag emoji from country name
export function getCountryFlag(country: string): string {
  const flagMap: Record<string, string> = {
    "United States": "🇺🇸",
    Germany: "🇩🇪",
    Singapore: "🇸🇬",
    "United Kingdom": "🇬🇧",
    France: "🇫🇷",
    Canada: "🇨🇦",
    Japan: "🇯🇵",
    Australia: "🇦🇺",
    Netherlands: "🇳🇱",
    India: "🇮🇳",
  }
  return flagMap[country] || "🌐"
}
