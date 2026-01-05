"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Smartphone, Zap } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"

export default function AppConfigPage() {
    const { config, loading, hasChanges, updateConfig, saveConfig, saving } = useConfig()
    const { user } = useAuth()
    const isAdmin = user?.role === "admin"

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">App Configuration</h1>
                    <p className="text-muted-foreground">Manage app versioning, caching, and maintenance mode</p>
                </div>
                <Button
                    onClick={saveConfig}
                    disabled={!hasChanges || saving || !isAdmin}
                    className="bg-gradient-to-r from-primary to-secondary"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Publish Changes
                    {hasChanges && (
                        <Badge variant="secondary" className="ml-2">
                            Draft
                        </Badge>
                    )}
                </Button>
            </div>

            <AdminAlert />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            Version Control
                        </CardTitle>
                        <CardDescription>Control minimum app versions and forced updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="minVersion">Minimum App Version</Label>
                                <Input
                                    id="minVersion"
                                    placeholder="e.g. 1.0.0"
                                    value={config.version.minVersion}
                                    onChange={(e) => updateConfig("version", "minVersion", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Users with a version lower than this will be forced to update.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cacheVersion">Cache Version</Label>
                                <Input
                                    id="cacheVersion"
                                    type="number"
                                    value={isNaN(config.version.cacheVersion) ? "" : config.version.cacheVersion}
                                    onChange={(e) => updateConfig("version", "cacheVersion", e.target.value === "" ? 0 : parseInt(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Increment this number to force ALL users to clear their local cache on next launch.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable to block access to the app for all users.
                                </p>
                            </div>
                            <Switch
                                checked={config.version.maintenanceMode}
                                onCheckedChange={(checked) => updateConfig("version", "maintenanceMode", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Feature Flags
                        </CardTitle>
                        <CardDescription>Control the availability of specific app features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { id: "killswitch", name: "Kill Switch", desc: "Automatically block internet if VPN disconnects" },
                            { id: "splitTunnel", name: "Split Tunneling", desc: "Allow users to exclude apps from VPN" },
                            { id: "autoReconnect", name: "Auto Reconnect", desc: "Automatically reconnect on network changes" },
                            { id: "subscriptions", name: "Subscriptions", desc: "Enable in-app subscription purchases" },
                            { id: "experimental", name: "Experimental Features", desc: "Enable beta features for testing" },
                        ].map((feature) => (
                            <div key={feature.id} className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label htmlFor={feature.id} className="text-base font-semibold">
                                            {feature.name}
                                        </Label>
                                        {config.features[feature.id as keyof typeof config.features] ? (
                                            <Badge variant="outline" className="text-green-500 border-green-500">Enabled</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500 border-gray-500">Disabled</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{feature.desc}</p>
                                </div>
                                <Switch
                                    id={feature.id}
                                    checked={config.features[feature.id as keyof typeof config.features]}
                                    onCheckedChange={(val) => updateConfig("features", feature.id, val)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
