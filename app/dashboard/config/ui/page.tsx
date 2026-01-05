"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Loader2, Palette, Upload } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"

export default function UiConfigPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">UI & Branding</h1>
                    <p className="text-muted-foreground">Customize the mobile app appearance and branding</p>
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
                        <Palette className="h-5 w-5 text-primary" />
                        Theme Customization
                    </CardTitle>
                    <CardDescription>Colors, logos, and text content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={config.ui.primaryColor}
                                    onChange={(e) => updateConfig("ui", "primaryColor", e.target.value)}
                                    className="w-20 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    value={config.ui.primaryColor}
                                    className="flex-1"
                                    onChange={(e) => updateConfig("ui", "primaryColor", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accentColor">Accent Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="accentColor"
                                    type="color"
                                    value={config.ui.accentColor}
                                    onChange={(e) => updateConfig("ui", "accentColor", e.target.value)}
                                    className="w-20 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    value={config.ui.accentColor}
                                    className="flex-1"
                                    onChange={(e) => updateConfig("ui", "accentColor", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appName">App Name</Label>
                            <Input
                                id="appName"
                                value={config.ui.appName}
                                onChange={(e) => updateConfig("ui", "appName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="logoUrl"
                                    value={config.ui.logoUrl}
                                    onChange={(e) => updateConfig("ui", "logoUrl", e.target.value)}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="icon">
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="showcaseText">Feature Showcase Text</Label>
                        <Textarea
                            id="showcaseText"
                            value={config.ui.showcaseText}
                            onChange={(e) => updateConfig("ui", "showcaseText", e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>
        </div >

    )
}
