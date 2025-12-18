"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Zap } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function FeaturesConfigPage() {
    const { config, loading, hasChanges, updateConfig, saveConfig, saving, getChanges } = useConfig()
    const { user } = useAuth()
    const isAdmin = user?.role === "admin"
    const [showPublishDialog, setShowPublishDialog] = useState(false)

    const changes = showPublishDialog ? getChanges() : []

    const handlePublish = async () => {
        const success = await saveConfig()
        if (success) {
            setShowPublishDialog(false)
        }
    }

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
                    <h1 className="text-3xl font-bold tracking-tight">App Config</h1>
                    <p className="text-muted-foreground">Toggle features on/off without deploying new versions</p>
                </div>

                <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                    <DialogTrigger asChild>
                        <Button
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
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>Review Changes</DialogTitle>
                            <DialogDescription>
                                The following changes will be applied to the configuration.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            {changes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No changes detected.</p>
                            ) : (
                                <div className="space-y-4">
                                    {changes.map((change, i) => (
                                        <div key={i} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="font-medium text-sm text-primary break-all">
                                                {change.path}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-muted/50 p-2 rounded text-muted-foreground break-all">
                                                    <span className="font-semibold block mb-1 text-red-500/70">Original:</span>
                                                    {String(change.oldValue)}
                                                </div>
                                                <div className="bg-muted/50 p-2 rounded text-foreground break-all">
                                                    <span className="font-semibold block mb-1 text-green-500/70">New:</span>
                                                    {String(change.newValue)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handlePublish} disabled={saving} className="bg-primary">
                                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Confirm & Publish
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <AdminAlert />

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
        </div >

    )
}
