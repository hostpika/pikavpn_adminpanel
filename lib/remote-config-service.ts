import { fetchWithAuth } from "@/lib/api-client"

export interface AppConfig {
  features: {
    freeVpn: boolean
    premiumVpn: boolean
    adsEnabled: boolean
    speedTest: boolean
    multiHops: boolean
  }
  vpn: {
    defaultProtocol: "UDP" | "TCP"
    keepAlive: number
    mtu: number
    dns: string[]
  }
  ui: {
    theme: "dark" | "light" | "system"
    primaryColor: string
    showServerLoad: boolean
  }
  version: {
    android: string
    ios: string
    forceUpdate: boolean
    message: string | null
  }
  ads: {
    activeProfileId: string
    profiles: any[]
    settings: any
  }
}

export async function getConfig(): Promise<AppConfig> {
  const response = await fetchWithAuth("/api/admin/config")

  if (!response.ok) {
    throw new Error("Failed to fetch configuration")
  }

  return response.json()
}

export async function updateConfig(config: Partial<AppConfig>): Promise<void> {
  const response = await fetchWithAuth("/api/admin/config", {
    method: "POST", // The secure API uses POST for updates
    body: JSON.stringify(config),
  })

  if (!response.ok) {
    throw new Error("Failed to update configuration")
  }
}
