"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Zap } from "lucide-react"
import { useConfig } from "@/hooks/use-config"

export default function FeaturesConfigPage() {
    const { config, loading, hasChanges, updateConfig, saveConfig, saving } = useConfig()

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Features Configuration</h1>
                        <p className="text-muted-foreground">Toggle features on/off without deploying new versions</p>
                    </div>
                    <Button
                        onClick={saveConfig}
                        disabled={!hasChanges || saving}
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
                            { id: "ads", name: "Advertisements", desc: "Show ads to free tier users" },
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
        </DashboardLayout>
    )
}
