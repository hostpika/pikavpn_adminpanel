"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bell, Palette, Globe, Clock, Database, Download, Trash2, Check, Zap, Monitor } from "lucide-react"
import { usePreferences } from "@/components/preferences-provider"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"

export default function PreferencesPage() {
  const { colorScheme, setColorScheme, sidebarDensity, setSidebarDensity } = usePreferences()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Local state for non-global preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [serverAlerts, setServerAlerts] = useState(true)
  const [userAlerts, setUserAlerts] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState([30])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load ALL preferences (including local ones) from API on mount
  useEffect(() => {
    if (!user) return

    const loadSettings = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/preferences")
        if (res.ok) {
          const data = await res.json()
          const p = data.preferences
          if (p) {
            if (p.emailNotifications !== undefined) setEmailNotifications(p.emailNotifications)
            if (p.pushNotifications !== undefined) setPushNotifications(p.pushNotifications)
            if (p.serverAlerts !== undefined) setServerAlerts(p.serverAlerts)
            if (p.userAlerts !== undefined) setUserAlerts(p.userAlerts)
            if (p.autoRefresh !== undefined) setAutoRefresh(p.autoRefresh)
            if (p.refreshInterval !== undefined) setRefreshInterval(p.refreshInterval)
            // Provider handles colorScheme/density separately via its own sync
          }
        }
      } catch (e) {
        console.error("Failed to load settings", e)
      }
    }
    loadSettings()
  }, [user])

  // Helper to save any preference change
  const saveSetting = async (key: string, value: any) => {
    try {
      // Optimistic update handled by local setters
      // Save to cloud
      await fetchWithAuth("/api/admin/preferences", {
        method: "POST",
        body: JSON.stringify({ preferences: { [key]: value } })
      })
    } catch (e) {
      console.error(`Failed to save ${key}`, e)
      toast.error("Error saving setting", {
        description: "Could not save your changes to the cloud.",
      })
    }
  }

  // Wrappers to update state AND save
  const handleEmailChange = (checked: boolean) => { setEmailNotifications(checked); saveSetting("emailNotifications", checked); }
  const handlePushChange = (checked: boolean) => { setPushNotifications(checked); saveSetting("pushNotifications", checked); }
  const handleServerAlertsChange = (checked: boolean) => { setServerAlerts(checked); saveSetting("serverAlerts", checked); }
  const handleUserAlertsChange = (checked: boolean) => { setUserAlerts(checked); saveSetting("userAlerts", checked); }
  const handleAutoRefreshChange = (checked: boolean) => { setAutoRefresh(checked); saveSetting("autoRefresh", checked); }
  const handleRefreshIntervalChange = (val: number[]) => { setRefreshInterval(val); saveSetting("refreshInterval", val); }

  const colorSchemes = [
    { id: "blue" as const, name: "Blue", gradient: "from-blue-500 to-cyan-500" },
    { id: "purple" as const, name: "Purple", gradient: "from-purple-500 to-pink-500" },
    { id: "green" as const, name: "Green", gradient: "from-green-500 to-teal-500" },
    { id: "orange" as const, name: "Orange", gradient: "from-orange-500 to-amber-500" },
    { id: "pink" as const, name: "Pink", gradient: "from-pink-500 to-rose-500" },
  ]

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Preferences</h1>
        <p className="text-muted-foreground mt-1">Customize your dashboard experience and notification settings</p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={handleEmailChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={handlePushChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Server Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about server status changes</p>
              </div>
              <Switch checked={serverAlerts} onCheckedChange={handleServerAlertsChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">User Activity Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for new user registrations and activities
                </p>
              </div>
              <Switch checked={userAlerts} onCheckedChange={handleUserAlertsChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Theme</Label>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <div className="h-16 w-full rounded bg-white border mb-2"></div>
                <span className="text-sm font-medium">Light</span>
              </Label>
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <div className="h-16 w-full rounded bg-slate-950 border mb-2"></div>
                <span className="text-sm font-medium">Dark</span>
              </Label>
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <div className="h-16 w-full rounded bg-gradient-to-r from-white to-slate-950 border mb-2"></div>
                <span className="text-sm font-medium">System</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">Color Scheme</Label>
            <div className="grid grid-cols-5 gap-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id)}
                  className={cn(
                    "relative h-16 w-full rounded-lg border-2 transition-all hover:scale-105",
                    colorScheme === scheme.id ? "border-primary ring-2 ring-primary/20" : "border-muted",
                  )}
                >
                  <div className={cn("h-full w-full rounded-md bg-gradient-to-br", scheme.gradient)} />
                  {colorScheme === scheme.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                  <span className="sr-only">{scheme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">Sidebar Density</Label>
            <Select value={sidebarDensity} onValueChange={(value) => setSidebarDensity(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dashboard Settings
          </CardTitle>
          <CardDescription>Configure dashboard behavior and data refresh settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">Automatically refresh dashboard data</p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={handleAutoRefreshChange} />
          </div>

          {autoRefresh && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Refresh Interval</Label>
                  <span className="text-sm text-muted-foreground">{refreshInterval[0]} seconds</span>
                </div>
                <Slider
                  value={refreshInterval}
                  onValueChange={handleRefreshIntervalChange}
                  min={10}
                  max={120}
                  step={10}
                  className="w-full"
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">Default Dashboard View</Label>
            <Select defaultValue="overview">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="servers">Servers</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your data, exports, and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={() => toast.success("Preferences Saved", { description: "Your settings have been saved to the cloud." })}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
