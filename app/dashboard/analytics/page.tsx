"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, TrendingDown, Users, Activity, DollarSign, Server, Calendar } from "lucide-react"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
  // Sample data
  const connectionData = [
    { date: "Jan 1", attempts: 4200, successful: 4050, failed: 150 },
    { date: "Jan 2", attempts: 4500, successful: 4365, failed: 135 },
    { date: "Jan 3", attempts: 4100, successful: 3998, failed: 102 },
    { date: "Jan 4", attempts: 4800, successful: 4656, failed: 144 },
    { date: "Jan 5", attempts: 5200, successful: 5096, failed: 104 },
    { date: "Jan 6", attempts: 5500, successful: 5390, failed: 110 },
    { date: "Jan 7", attempts: 5800, successful: 5684, failed: 116 },
  ]

  const serverLocationData = [
    { location: "United States", connections: 12500, flag: "🇺🇸" },
    { location: "United Kingdom", connections: 8200, flag: "🇬🇧" },
    { location: "Germany", connections: 6800, flag: "🇩🇪" },
    { location: "Singapore", connections: 5400, flag: "🇸🇬" },
    { location: "Japan", connections: 4900, flag: "🇯🇵" },
    { location: "Canada", connections: 3700, flag: "🇨🇦" },
  ]

  const failureReasons = [
    { reason: "Timeout", value: 35, color: "#ef4444" },
    { reason: "Auth Failed", value: 25, color: "#f97316" },
    { reason: "Server Unavailable", value: 20, color: "#f59e0b" },
    { reason: "Network Error", value: 15, color: "#eab308" },
    { reason: "User Cancelled", value: 5, color: "#84cc16" },
  ]

  const revenueData = [
    { month: "Jul", subscriptions: 15400, ads: 3200, total: 18600 },
    { month: "Aug", subscriptions: 17200, ads: 3500, total: 20700 },
    { month: "Sep", subscriptions: 19800, ads: 3800, total: 23600 },
    { month: "Oct", subscriptions: 22100, ads: 4100, total: 26200 },
    { month: "Nov", subscriptions: 25300, ads: 4300, total: 29600 },
    { month: "Dec", subscriptions: 28900, ads: 4600, total: 33500 },
  ]

  const cohortData = [
    { cohort: "Week 1", day1: 100, day7: 65, day14: 52, day30: 38 },
    { cohort: "Week 2", day1: 100, day7: 68, day14: 55, day30: 41 },
    { cohort: "Week 3", day1: 100, day7: 71, day14: 58, day30: 45 },
    { cohort: "Week 4", day1: 100, day7: 73, day14: 61, day30: 48 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.3% from last week
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45m 32s</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5m from last week
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33,873</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$33,500</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +13.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        {/* Connection Analytics */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Attempts Over Time</CardTitle>
              <CardDescription>Total, successful, and failed connection attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  attempts: { label: "Total Attempts", color: "hsl(var(--chart-1))" },
                  successful: { label: "Successful", color: "hsl(var(--chart-2))" },
                  failed: { label: "Failed", color: "hsl(var(--chart-3))" },
                }}
                className="h-[350px]"
              >
                <LineChart data={connectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="attempts" stroke="var(--color-attempts)" strokeWidth={2} />
                  <Line type="monotone" dataKey="successful" stroke="var(--color-successful)" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="var(--color-failed)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Server Locations</CardTitle>
                <CardDescription>Connections by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverLocationData.map((loc, index) => (
                    <div key={loc.location} className="flex items-center gap-3">
                      <span className="text-2xl">{loc.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{loc.location}</span>
                          <span className="text-sm text-muted-foreground">{loc.connections.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${(loc.connections / 12500) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Failure Analysis</CardTitle>
                <CardDescription>Breakdown of failure reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Percentage", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={failureReasons}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ reason, value }) => `${reason}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {failureReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {failureReasons.map((reason) => (
                    <div key={reason.reason} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reason.color }} />
                        <span>{reason.reason}</span>
                      </div>
                      <span className="font-medium">{reason.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Behavior Analytics */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Cohort Analysis</CardTitle>
              <CardDescription>Retention rates by signup cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Cohort</th>
                      <th className="text-center p-3 font-semibold">Day 1</th>
                      <th className="text-center p-3 font-semibold">Day 7</th>
                      <th className="text-center p-3 font-semibold">Day 14</th>
                      <th className="text-center p-3 font-semibold">Day 30</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="p-3 font-medium">{cohort.cohort}</td>
                        <td className="text-center p-3">
                          <Badge className="bg-green-500">{cohort.day1}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-green-400">{cohort.day7}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-yellow-500">{cohort.day14}%</Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge className="bg-orange-500">{cohort.day30}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption</CardTitle>
                <CardDescription>Percentage of users using each feature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { feature: "Kill Switch", adoption: 78 },
                  { feature: "Split Tunneling", adoption: 45 },
                  { feature: "Auto Reconnect", adoption: 92 },
                  { feature: "Server Selection", adoption: 65 },
                  { feature: "Rewarded Ads", adoption: 32 },
                ].map((item) => (
                  <div key={item.feature}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.feature}</span>
                      <span className="text-sm text-muted-foreground">{item.adoption}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${item.adoption}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Distribution</CardTitle>
                <CardDescription>Duration of typical sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sessions: { label: "Sessions", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[250px]"
                >
                  <BarChart
                    data={[
                      { duration: "0-5m", sessions: 1200 },
                      { duration: "5-15m", sessions: 2400 },
                      { duration: "15-30m", sessions: 3800 },
                      { duration: "30-60m", sessions: 5200 },
                      { duration: "60m+", sessions: 4100 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="duration" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground">Average Session Duration</div>
                  <div className="text-2xl font-bold gradient-text">45 minutes 32 seconds</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue breakdown by source</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  subscriptions: { label: "Subscriptions", color: "hsl(var(--chart-1))" },
                  ads: { label: "Ads", color: "hsl(var(--chart-2))" },
                  total: { label: "Total", color: "hsl(var(--chart-3))" },
                }}
                className="h-[350px]"
              >
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="subscriptions"
                    stackId="a"
                    fill="var(--color-subscriptions)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar dataKey="ads" stackId="a" fill="var(--color-ads)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>MRR Growth</CardTitle>
                <CardDescription>Monthly Recurring Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">$28,900</div>
                <div className="flex items-center text-sm text-green-500 mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +14.2% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ARPU</CardTitle>
                <CardDescription>Average Revenue Per User</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">$8.52</div>
                <div className="flex items-center text-sm text-green-500 mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2.1% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Monthly subscription churn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">3.8%</div>
                <div className="flex items-center text-sm text-green-500 mt-2">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -0.5% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>User distribution and revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tier: "Free Users", users: 18500, revenue: 0, percentage: 55 },
                  { tier: "Trial Users", users: 3200, revenue: 0, percentage: 9 },
                  { tier: "Basic Subscribers", users: 7850, revenue: 39175, percentage: 23 },
                  { tier: "Premium Subscribers", users: 4323, revenue: 43199, percentage: 13 },
                ].map((segment) => (
                  <div key={segment.tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold mb-1">{segment.tier}</div>
                      <div className="text-sm text-muted-foreground">
                        {segment.users.toLocaleString()} users ({segment.percentage}%)
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Revenue Contribution</span>
                        <span className="text-sm font-semibold">${segment.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${(segment.revenue / 82374) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Server Analytics */}
        <TabsContent value="servers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs text-muted-foreground mt-1">85 free, 71 premium</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Server Load</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-xs text-green-500 mt-1">Within capacity</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Tier Traffic</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">62%</div>
                <div className="text-xs text-muted-foreground mt-1">of total connections</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Utilization</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <div className="text-xs text-green-500 mt-1">Good utilization</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Server Performance by Location</CardTitle>
              <CardDescription>Load and uptime metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Location</th>
                      <th className="text-center p-3 font-semibold">Servers</th>
                      <th className="text-center p-3 font-semibold">Avg Load</th>
                      <th className="text-center p-3 font-semibold">Uptime</th>
                      <th className="text-center p-3 font-semibold">Connections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { location: "🇺🇸 United States", servers: 42, load: 71, uptime: 99.98, connections: 12500 },
                      { location: "🇬🇧 United Kingdom", servers: 18, load: 65, uptime: 99.95, connections: 8200 },
                      { location: "🇩🇪 Germany", servers: 22, load: 58, uptime: 99.97, connections: 6800 },
                      { location: "🇸🇬 Singapore", servers: 15, load: 73, uptime: 99.92, connections: 5400 },
                      { location: "🇯🇵 Japan", servers: 20, load: 62, uptime: 99.96, connections: 4900 },
                      { location: "🇨🇦 Canada", servers: 12, load: 55, uptime: 99.99, connections: 3700 },
                    ].map((row) => (
                      <tr key={row.location} className="border-b hover:bg-accent">
                        <td className="p-3 font-medium">{row.location}</td>
                        <td className="text-center p-3">{row.servers}</td>
                        <td className="text-center p-3">
                          <Badge variant={row.load > 80 ? "destructive" : row.load > 70 ? "secondary" : "outline"}>
                            {row.load}%
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            {row.uptime}%
                          </Badge>
                        </td>
                        <td className="text-center p-3">{row.connections.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}
