"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2, DollarSign } from "lucide-react"
import { useConfig } from "@/hooks/use-config"

export default function AdsConfigPage() {
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
                        <h1 className="text-3xl font-bold tracking-tight">Advertising</h1>
                        <p className="text-muted-foreground">Manage monetization settings and ad networks</p>
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
                            <DollarSign className="h-5 w-5 text-primary" />
                            Ad Networks
                        </CardTitle>
                        <CardDescription>Configure ad providers and placements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="admobEnabled" className="text-base font-semibold">AdMob Enabled</Label>
                            </div>
                            <Switch
                                id="admobEnabled"
                                checked={config.ads.admobEnabled}
                                onCheckedChange={(val) => updateConfig("ads", "admobEnabled", val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="fanEnabled" className="text-base font-semibold">Facebook Audience Network</Label>
                            </div>
                            <Switch
                                id="fanEnabled"
                                checked={config.ads.fanEnabled}
                                onCheckedChange={(val) => updateConfig("ads", "fanEnabled", val)}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold">AdMob Unit IDs</h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bannerUnitId">Banner Ad Unit ID</Label>
                                    <Input
                                        id="bannerUnitId"
                                        value={config.ads.bannerUnitId}
                                        onChange={(e) => updateConfig("ads", "bannerUnitId", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="adFrequency">Interstitial Frequency</Label>
                                <Input
                                    id="adFrequency"
                                    type="number"
                                    value={config.ads.adFrequency}
                                    onChange={(e) => updateConfig("ads", "adFrequency", parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bannerPosition">Banner Position</Label>
                                <Select
                                    value={config.ads.bannerPosition}
                                    onValueChange={(val) => updateConfig("ads", "bannerPosition", val)}
                                >
                                    <SelectTrigger id="bannerPosition">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="top">Top of Screen</SelectItem>
                                        <SelectItem value="bottom">Bottom of Screen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
