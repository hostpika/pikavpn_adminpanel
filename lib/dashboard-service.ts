import { getServers } from "./server-service"
import { getUsers } from "./user-service"

export interface DashboardStats {
  dailyActiveUsers: number
  activeConnections: number
  serversOnline: string
  monthlyRevenue: string
  dailyActiveUsersChange: string
  activeConnectionsChange: string
  serversOnlinePercentage: string
  monthlyRevenueChange: string
}

export interface ConnectionDataPoint {
  time: string
  connections: number
}

export interface ServerLoadDataPoint {
  location: string
  load: number
}

export interface UserGrowthDataPoint {
  month: string
  free: number
  premium: number
}

export interface TopCountry {
  country: string
  users: string
}

export interface RecentActivity {
  action: string
  time: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const servers = await getServers()
  const users = await getUsers()

  const onlineServers = servers.filter((s) => s.status === "online").length
  const totalServers = servers.length
  const activeUsers = users.filter((u) => u.status === "active" || u.status === "premium").length
  const premiumUsers = users.filter((u) => u.tier === "premium").length

  // Calculate monthly revenue (assuming $10/month per premium user)
  const monthlyRevenue = premiumUsers * 10

  return {
    dailyActiveUsers: activeUsers,
    activeConnections: Math.floor(activeUsers * 0.7), // Estimate 70% are currently connected
    serversOnline: `${onlineServers}/${totalServers}`,
    monthlyRevenue: `$${monthlyRevenue.toLocaleString()}`,
    dailyActiveUsersChange: "+12.5%",
    activeConnectionsChange: "+8.2%",
    serversOnlinePercentage: `${((onlineServers / totalServers) * 100).toFixed(1)}%`,
    monthlyRevenueChange: "+23.1%",
  }
}

export async function getConnectionData(): Promise<ConnectionDataPoint[]> {
  // In a real app, this would fetch from analytics collection
  // For now, return calculated data based on active users
  const users = await getUsers()
  const activeCount = users.filter((u) => u.status === "active" || u.status === "premium").length

  return [
    { time: "00:00", connections: Math.floor(activeCount * 0.3) },
    { time: "04:00", connections: Math.floor(activeCount * 0.2) },
    { time: "08:00", connections: Math.floor(activeCount * 0.6) },
    { time: "12:00", connections: Math.floor(activeCount * 0.8) },
    { time: "16:00", connections: Math.floor(activeCount * 0.7) },
    { time: "20:00", connections: Math.floor(activeCount * 0.9) },
  ]
}

export async function getServerLoadData(): Promise<ServerLoadDataPoint[]> {
  const servers = await getServers()

  // Group servers by country and calculate average load
  const loadByCountry = servers.reduce(
    (acc, server) => {
      if (!acc[server.country]) {
        acc[server.country] = { totalLoad: 0, count: 0 }
      }
      acc[server.country].totalLoad += server.load
      acc[server.country].count += 1
      return acc
    },
    {} as Record<string, { totalLoad: number; count: number }>,
  )

  return Object.entries(loadByCountry)
    .map(([country, data]) => ({
      location: country,
      load: Math.round(data.totalLoad / data.count),
    }))
    .slice(0, 5) // Top 5 locations
}

export async function getUserGrowthData(): Promise<UserGrowthDataPoint[]> {
  // In a real app, this would fetch historical data
  // For now, return sample data
  return [
    { month: "Jan", free: 12000, premium: 4200 },
    { month: "Feb", free: 14500, premium: 5100 },
    { month: "Mar", free: 16800, premium: 6400 },
    { month: "Apr", free: 18200, premium: 7800 },
    { month: "May", free: 20500, premium: 9200 },
    { month: "Jun", free: 23400, premium: 11500 },
  ]
}

export async function getTopCountries(): Promise<TopCountry[]> {
  // In a real app, this would aggregate user locations
  return [
    { country: "United States", users: "8,432" },
    { country: "United Kingdom", users: "5,218" },
    { country: "Germany", users: "3,897" },
    { country: "Canada", users: "2,654" },
  ]
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  // In a real app, this would fetch from activity logs collection
  return [
    { action: "New server added", time: "5 min ago" },
    { action: "User upgraded", time: "12 min ago" },
    { action: "Config updated", time: "1 hour ago" },
    { action: "Backup completed", time: "2 hours ago" },
  ]
}

export async function getSystemHealth() {
  return [
    { name: "API Status", status: "Operational", color: "text-green-500" },
    { name: "Database", status: "Operational", color: "text-green-500" },
    { name: "Storage", status: "Operational", color: "text-green-500" },
    { name: "Auth Service", status: "Operational", color: "text-green-500" },
  ]
}
