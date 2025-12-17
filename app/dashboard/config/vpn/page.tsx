"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2, Shield } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"

export default function VpnConfigPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">VPN Configuration</h1>
                    <p className="text-muted-foreground">Technical settings for VPN connections</p>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Connection Settings
                    </CardTitle>
                    <CardDescription>Configure timeouts, protocols, and DNS settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                            <Input
                                id="connectionTimeout"
                                type="number"
                                value={config.vpn.connectionTimeout}
                                onChange={(e) => updateConfig("vpn", "connectionTimeout", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reconnectAttempts">Reconnect Attempts</Label>
                            <Input
                                id="reconnectAttempts"
                                type="number"
                                value={config.vpn.reconnectAttempts}
                                onChange={(e) => updateConfig("vpn", "reconnectAttempts", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reconnectDelay">Reconnect Delay (seconds)</Label>
                            <Input
                                id="reconnectDelay"
                                type="number"
                                value={config.vpn.reconnectDelay}
                                onChange={(e) => updateConfig("vpn", "reconnectDelay", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="protocol">Preferred Protocol</Label>
                            <Select
                                value={config.vpn.protocol}
                                onValueChange={(val) => updateConfig("vpn", "protocol", val)}
                            >
                                <SelectTrigger id="protocol">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                                    <SelectItem value="udp">UDP (Faster)</SelectItem>
                                    <SelectItem value="tcp">TCP (More Reliable)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="customDns">Custom DNS Servers</Label>
                        <Textarea
                            id="customDns"
                            value={config.vpn.customDns}
                            onChange={(e) => updateConfig("vpn", "customDns", e.target.value)}
                            rows={3}
                            placeholder="8.8.8.8, 8.8.4.4"
                        />
                        <p className="text-xs text-muted-foreground">Comma-separated list of DNS servers</p>
                    </div>
                </CardContent>
            </Card>
        </div >

    )
}
