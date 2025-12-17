"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Bell, Palette, Globe, Clock, Database, Download, Trash2, Check } from "lucide-react"
import { usePreferences } from "@/components/preferences-provider"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export default function PreferencesPage() {
  const { colorScheme, setColorScheme, sidebarDensity, setSidebarDensity } = usePreferences()
  const { theme, setTheme } = useTheme()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [serverAlerts, setServerAlerts] = useState(true)
  const [userAlerts, setUserAlerts] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState([30])

  const colorSchemes = [
    { id: "blue" as const, name: "Blue", gradient: "from-blue-500 to-cyan-500" },
    { id: "purple" as const, name: "Purple", gradient: "from-purple-500 to-pink-500" },
    { id: "green" as const, name: "Green", gradient: "from-green-500 to-teal-500" },
    { id: "orange" as const, name: "Orange", gradient: "from-orange-500 to-amber-500" },
    { id: "pink" as const, name: "Pink", gradient: "from-pink-500 to-rose-500" },
  ]

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
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Server Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about server status changes</p>
              </div>
              <Switch checked={serverAlerts} onCheckedChange={setServerAlerts} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">User Activity Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for new user registrations and activities
                </p>
              </div>
              <Switch checked={userAlerts} onCheckedChange={setUserAlerts} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base">Email Digest Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
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
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
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

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>Set your timezone, language, and date format preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                  <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                  <SelectItem value="cet">Central European (GMT+1)</SelectItem>
                  <SelectItem value="jst">Japan Standard (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Time Format</Label>
              <Select defaultValue="12">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
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
                  onValueChange={setRefreshInterval}
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
        <Button>Save Preferences</Button>
      </div>
    </div>

  )
}
