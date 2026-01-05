"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  Database,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
} from "lucide-react"

export default function MonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and activity logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firebase Services</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All services operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPN Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold">154/156</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">2 servers offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold">8,432</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">142 connections/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold">3 Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">2 warnings, 1 info</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Detailed health metrics for all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Firebase Firestore",
                status: "healthy",
                latency: "12ms",
                errorRate: "0.01%",
                uptime: "99.98%",
              },
              {
                name: "Firebase Storage",
                status: "healthy",
                latency: "45ms",
                errorRate: "0.03%",
                uptime: "99.95%",
              },
              {
                name: "Firebase Authentication",
                status: "healthy",
                latency: "89ms",
                errorRate: "0.05%",
                uptime: "99.97%",
              },
              {
                name: "Remote Config",
                status: "healthy",
                latency: "34ms",
                errorRate: "0.00%",
                uptime: "99.99%",
              },
              {
                name: "VPN Infrastructure",
                status: "warning",
                latency: "156ms",
                errorRate: "1.2%",
                uptime: "99.12%",
              },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {service.status === "healthy" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-semibold">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Latency: {service.latency} | Error Rate: {service.errorRate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-semibold">{service.uptime}</div>
                  </div>
                  <Badge variant={service.status === "healthy" ? "outline" : "secondary"} className="capitalize">
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Logs and Alerts */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="connections">Live Connections</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* System Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Recent system alerts and warnings</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    severity: "warning",
                    title: "High Server Load",
                    description: "US-East-02 server load at 95% capacity",
                    time: "2 minutes ago",
                    acknowledged: false,
                  },
                  {
                    severity: "critical",
                    title: "Server Offline",
                    description: "EU-West-01 server went offline unexpectedly",
                    time: "15 minutes ago",
                    acknowledged: true,
                  },
                  {
                    severity: "warning",
                    title: "Increased Error Rate",
                    description: "Connection failures increased by 15% in the last hour",
                    time: "32 minutes ago",
                    acknowledged: false,
                  },
                  {
                    severity: "info",
                    title: "Scheduled Maintenance",
                    description: "Asia-Pacific servers maintenance scheduled for tonight",
                    time: "1 hour ago",
                    acknowledged: true,
                  },
                  {
                    severity: "critical",
                    title: "Database Query Latency",
                    description: "Firestore queries experiencing higher than normal latency",
                    time: "2 hours ago",
                    acknowledged: true,
                  },
                ].map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {alert.severity === "critical" ? (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-semibold">{alert.title}</div>
                        <Badge
                          variant={alert.acknowledged ? "outline" : "destructive"}
                          className={
                            alert.severity === "critical"
                              ? "bg-red-500/10 text-red-500 border-red-500"
                              : alert.severity === "warning"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500"
                                : "bg-blue-500/10 text-blue-500 border-blue-500"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Active VPN Connections</CardTitle>
                  <CardDescription>Real-time connection monitoring</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by user or server..." className="pl-9" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Total Active: </span>
                  <span className="font-semibold">8,432</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Connections/sec: </span>
                  <span className="font-semibold">2.4</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Peak Today: </span>
                  <span className="font-semibold">12,891</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">User</th>
                      <th className="text-left p-3 font-semibold">Server</th>
                      <th className="text-left p-3 font-semibold">Duration</th>
                      <th className="text-left p-3 font-semibold">Data Transfer</th>
                      <th className="text-left p-3 font-semibold">Speed</th>
                      <th className="text-left p-3 font-semibold">Location</th>
                      <th className="text-right p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        user: "user.1234@email.com",
                        server: "US-East-01",
                        duration: "1h 23m",
                        data: "2.4 GB",
                        speed: "15.2 Mbps",
                        location: "🇺🇸 New York",
                        tier: "premium",
                      },
                      {
                        user: "Anonymous-7x9k2",
                        server: "UK-London-03",
                        duration: "45m",
                        data: "890 MB",
                        speed: "8.7 Mbps",
                        location: "🇬🇧 London",
                        tier: "free",
                      },
                      {
                        user: "john.doe@example.com",
                        server: "DE-Frankfurt-02",
                        duration: "2h 14m",
                        data: "5.1 GB",
                        speed: "22.4 Mbps",
                        location: "🇩🇪 Berlin",
                        tier: "premium",
                      },
                      {
                        user: "Anonymous-m4p8t",
                        server: "SG-Singapore-01",
                        duration: "12m",
                        data: "124 MB",
                        speed: "6.3 Mbps",
                        location: "🇸🇬 Singapore",
                        tier: "free",
                      },
                      {
                        user: "premium.user@mail.com",
                        server: "JP-Tokyo-04",
                        duration: "3h 42m",
                        data: "8.7 GB",
                        speed: "28.9 Mbps",
                        location: "🇯🇵 Tokyo",
                        tier: "premium",
                      },
                    ].map((conn, index) => (
                      <tr key={index} className="border-b hover:bg-accent">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{conn.user}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={conn.tier === "premium" ? "default" : "secondary"}>{conn.server}</Badge>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{conn.duration}</td>
                        <td className="p-3 text-sm">{conn.data}</td>
                        <td className="p-3 text-sm">{conn.speed}</td>
                        <td className="p-3 text-sm">{conn.location}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            Disconnect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Administrative actions and system events</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="server">Server Changes</SelectItem>
                      <SelectItem value="user">User Actions</SelectItem>
                      <SelectItem value="config">Config Updates</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search logs..." className="pl-9 w-[200px]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    timestamp: "2024-01-15 14:32:18",
                    admin: "admin@cloudvpn.com",
                    action: "Server Added",
                    target: "EU-West-05",
                    changes: "New server added in Frankfurt",
                    ip: "192.168.1.45",
                  },
                  {
                    timestamp: "2024-01-15 14:15:42",
                    admin: "admin@cloudvpn.com",
                    action: "User Suspended",
                    target: "abuse.user@example.com",
                    changes: "Account suspended for ToS violation",
                    ip: "192.168.1.45",
                  },
                  {
                    timestamp: "2024-01-15 13:58:23",
                    admin: "moderator@cloudvpn.com",
                    action: "Config Updated",
                    target: "Feature Flags",
                    changes: "Enabled experimental features",
                    ip: "10.0.0.12",
                  },
                  {
                    timestamp: "2024-01-15 12:45:10",
                    admin: "admin@cloudvpn.com",
                    action: "Server Modified",
                    target: "US-East-02",
                    changes: "Increased capacity from 1000 to 1500",
                    ip: "192.168.1.45",
                  },
                  {
                    timestamp: "2024-01-15 11:22:35",
                    admin: "admin@cloudvpn.com",
                    action: "User Granted Premium",
                    target: "vip.user@example.com",
                    changes: "Manually granted premium access",
                    ip: "192.168.1.45",
                  },
                ].map((log, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold mb-1">{log.action}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{log.action.split(" ")[1] || "Action"}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Admin: </span>
                        <span className="font-medium">{log.admin}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-medium">{log.target}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Changes: </span>
                        <span>{log.changes}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IP: </span>
                        <span className="font-mono text-xs">{log.ip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}
