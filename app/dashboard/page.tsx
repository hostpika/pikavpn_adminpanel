"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Server, Globe, Shield, Zap, DollarSign, Loader2 } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  getDashboardStats,
  getConnectionData,
  getServerLoadData,
  getUserGrowthData,
  getTopCountries,
  getRecentActivity,
  getSystemHealth,
  type DashboardStats,
  type ConnectionDataPoint,
  type ServerLoadDataPoint,
  type UserGrowthDataPoint,
} from "@/lib/dashboard-service"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [connectionData, setConnectionData] = useState<ConnectionDataPoint[]>([])
  const [serverData, setServerData] = useState<ServerLoadDataPoint[]>([])
  const [userData, setUserData] = useState<UserGrowthDataPoint[]>([])
  const [topCountries, setTopCountries] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, connData, srvData, usrData, countries, activity, health] = await Promise.all([
        getDashboardStats(),
        getConnectionData(),
        getServerLoadData(),
        getUserGrowthData(),
        getTopCountries(),
        getRecentActivity(),
        getSystemHealth(),
      ])

      setStats(statsData)
      setConnectionData(connData)
      setServerData(srvData)
      setUserData(usrData)
      setTopCountries(countries)
      setRecentActivity(activity)
      setSystemHealth(health)
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Daily Active Users",
      value: stats?.dailyActiveUsers.toLocaleString() || "0",
      change: stats?.dailyActiveUsersChange || "+0%",
      icon: Users,
      gradient: "from-[#4c6ef5] to-[#5c7cfa]",
    },
    {
      title: "Active Connections",
      value: stats?.activeConnections.toLocaleString() || "0",
      change: stats?.activeConnectionsChange || "+0%",
      icon: Activity,
      gradient: "from-[#22b8cf] to-[#3bc9db]",
    },
    {
      title: "Servers Online",
      value: stats?.serversOnline || "0/0",
      change: stats?.serversOnlinePercentage || "0%",
      icon: Server,
      gradient: "from-[#be4bdb] to-[#cc5de8]",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyRevenue || "$0",
      change: stats?.monthlyRevenueChange || "+0%",
      icon: DollarSign,
      gradient: "from-[#51cf66] to-[#40c057]",
    },
  ]

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here's what's happening with your VPN network today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-semibold">{stat.change}</span> from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Activity */}
        <Card className="border-0 shadow-md min-h-[400px]">
          <CardHeader>
            <CardTitle>Connection Activity</CardTitle>
            <CardDescription>Active VPN connections over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                connections: {
                  label: "Active Connections",
                  color: "oklch(0.65 0.25 254)",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={connectionData}>
                <defs>
                  <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.25 254)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.25 254)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent nameKey="dataKey" labelKey="time" />} />
                <Area
                  type="monotone"
                  dataKey="connections"
                  stroke="oklch(0.65 0.25 254)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConnections)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Server Load */}
        <Card className="border-0 shadow-md min-h-[400px]">
          <CardHeader>
            <CardTitle>Server Load Distribution</CardTitle>
            <CardDescription>Current load across top server locations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                load: {
                  label: "Server Load (%)",
                  color: "oklch(0.72 0.22 190)",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={serverData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="location" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent nameKey="dataKey" labelKey="location" />} />
                <Bar dataKey="load" fill="oklch(0.72 0.22 190)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="border-0 shadow-md lg:col-span-2 min-h-[400px]">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>Free vs Premium user acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                free: {
                  label: "Free Users",
                  color: "oklch(0.75 0.28 305)",
                },
                premium: {
                  label: "Premium Users",
                  color: "oklch(0.65 0.25 254)",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent nameKey="dataKey" labelKey="month" />} />
                <Line type="monotone" dataKey="free" stroke="oklch(0.75 0.28 305)" strokeWidth={2} dot={{ r: 4 }} />
                <Line
                  type="monotone"
                  dataKey="premium"
                  stroke="oklch(0.65 0.25 254)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-md min-h-[280px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.name}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md min-h-[280px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-secondary" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCountries.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.country}</span>
                <span className="text-sm font-semibold">{item.users}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md min-h-[280px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="text-sm">{item.action}</div>
                <div className="text-xs text-muted-foreground">{item.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>

  )
}
