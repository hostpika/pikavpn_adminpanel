"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, DollarSign, Megaphone, Facebook, Ban } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"

export default function AdsConfigPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">Advertising</h1>
                    <p className="text-muted-foreground">Manage ad networks and placements</p>
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

            <AdminAlert message="You need permission to modify advertising settings." />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Primary Ad Provider
                        </CardTitle>
                        <CardDescription>
                            Select the single ad network that will serve ads in the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            defaultValue={config.ads.activeProvider}
                            onValueChange={(val) => updateConfig("ads", "activeProvider", val)}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="admob" id="admob" className="peer sr-only" />
                                <Label
                                    htmlFor="admob"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full"
                                >
                                    <div className="mb-3 p-2 bg-muted rounded-full">
                                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary" fill="currentColor" role="img" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21.24 21.01h-2.17l-1.63-3.66a8.87 8.87 0 0 0 .19-1.92A8.93 8.93 0 0 0 8.7 6.5a8.94 8.94 0 0 0-8.93 8.93 8.94 8.94 0 0 0 8.93 8.93c1.7 0 3.3-.47 4.67-1.28l4.47 1.87a1.69 1.69 0 0 0 2.21-1.05c.44-1.05.02-2.32-1.07-2.76l2.16-2.16.1.03zM8.7 20.84A5.4 5.4 0 1 1 8.7 10.04a5.4 5.4 0 0 1 0 10.8z m9.57-2.79l-2.09-4.7a1.66 1.66 0 0 0-1.05-2.21 1.69 1.69 0 0 0-2.21 1.05l-1.06 2.39a8.9 8.9 0 0 0 3.82 1.34l2.59 2.13z" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-semibold mb-2">Google AdMob</span>
                                    <Badge variant="secondary" className="mt-auto">Recommended</Badge>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="facebook" id="facebook" className="peer sr-only" />
                                <Label
                                    htmlFor="facebook"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full"
                                >
                                    <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                        <Facebook className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <span className="text-lg font-semibold mb-2">Facebook Audience</span>
                                    <span className="text-xs text-muted-foreground mt-auto">Meta Audience Network</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="none" id="none" className="peer sr-only" />
                                <Label
                                    htmlFor="none"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full"
                                >
                                    <div className="mb-3 p-2 bg-muted rounded-full">
                                        <Ban className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <span className="text-lg font-semibold mb-2">Disabled</span>
                                    <span className="text-xs text-muted-foreground mt-auto">No ads will be shown</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Tabs defaultValue="admob" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="admob" className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" role="img" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.24 21.01h-2.17l-1.63-3.66a8.87 8.87 0 0 0 .19-1.92A8.93 8.93 0 0 0 8.7 6.5a8.94 8.94 0 0 0-8.93 8.93 8.94 8.94 0 0 0 8.93 8.93c1.7 0 3.3-.47 4.67-1.28l4.47 1.87a1.69 1.69 0 0 0 2.21-1.05c.44-1.05.02-2.32-1.07-2.76l2.16-2.16.1.03zM8.7 20.84A5.4 5.4 0 1 1 8.7 10.04a5.4 5.4 0 0 1 0 10.8z m9.57-2.79l-2.09-4.7a1.66 1.66 0 0 0-1.05-2.21 1.69 1.69 0 0 0-2.21 1.05l-1.06 2.39a8.9 8.9 0 0 0 3.82 1.34l2.59 2.13z" />
                            </svg>
                            Google AdMob
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            Facebook Audience
                        </TabsTrigger>
                        <TabsTrigger value="general">General Settings</TabsTrigger>
                    </TabsList>

                    {/* ADMOB CONFIG */}
                    <TabsContent value="admob">
                        <Card>
                            <CardHeader>
                                <CardTitle>AdMob Configuration</CardTitle>
                                <CardDescription>Configure Google AdMob unit IDs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="admobAppId">App ID</Label>
                                        <Input
                                            id="admobAppId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                                            value={config.ads.admobAppId}
                                            onChange={(e) => updateConfig("ads", "admobAppId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admobOpenAppId">App Open ID</Label>
                                        <Input
                                            id="admobOpenAppId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                                            value={config.ads.admobOpenAppId}
                                            onChange={(e) => updateConfig("ads", "admobOpenAppId", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="admobBannerId">Banner ID</Label>
                                        <Input
                                            id="admobBannerId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                                            value={config.ads.admobBannerId}
                                            onChange={(e) => updateConfig("ads", "admobBannerId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admobInterstitialId">Interstitial ID</Label>
                                        <Input
                                            id="admobInterstitialId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                                            value={config.ads.admobInterstitialId}
                                            onChange={(e) => updateConfig("ads", "admobInterstitialId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admobNativeId">Native Advanced ID</Label>
                                        <Input
                                            id="admobNativeId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                                            value={config.ads.admobNativeId}
                                            onChange={(e) => updateConfig("ads", "admobNativeId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admobRewardedId">Rewarded Video ID</Label>
                                        <Input
                                            id="admobRewardedId"
                                            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                                            value={config.ads.admobRewardedId}
                                            onChange={(e) => updateConfig("ads", "admobRewardedId", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FACEBOOK CONFIG */}
                    <TabsContent value="facebook">
                        <Card>
                            <CardHeader>
                                <CardTitle>Facebook Audience Network</CardTitle>
                                <CardDescription>Configure Meta Audience Network placement IDs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fanAppId">App ID (Meta)</Label>
                                    <Input
                                        id="fanAppId"
                                        placeholder="Enter your Meta App ID"
                                        value={config.ads.fanAppId}
                                        onChange={(e) => updateConfig("ads", "fanAppId", e.target.value)}
                                    />
                                </div>
                                <Separator />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fanBannerId">Banner Placement ID</Label>
                                        <Input
                                            id="fanBannerId"
                                            placeholder="IMG_16_9_APP_INSTALL#YOUR_PLACEMENT_ID"
                                            value={config.ads.fanBannerId}
                                            onChange={(e) => updateConfig("ads", "fanBannerId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fanInterstitialId">Interstitial Placement ID</Label>
                                        <Input
                                            id="fanInterstitialId"
                                            placeholder="IMG_16_9_APP_INSTALL#YOUR_PLACEMENT_ID"
                                            value={config.ads.fanInterstitialId}
                                            onChange={(e) => updateConfig("ads", "fanInterstitialId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fanNativeId">Native Placement ID</Label>
                                        <Input
                                            id="fanNativeId"
                                            placeholder="IMG_16_9_APP_INSTALL#YOUR_PLACEMENT_ID"
                                            value={config.ads.fanNativeId}
                                            onChange={(e) => updateConfig("ads", "fanNativeId", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fanRewardedId">Rewarded Video Placement ID</Label>
                                        <Input
                                            id="fanRewardedId"
                                            placeholder="IMG_16_9_APP_INSTALL#YOUR_PLACEMENT_ID"
                                            value={config.ads.fanRewardedId}
                                            onChange={(e) => updateConfig("ads", "fanRewardedId", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* GENERAL SETTINGS */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Display Settings</CardTitle>
                                <CardDescription>Configure how and when ads are displayed.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Ad Frequency</Label>
                                        <Select
                                            value={String(config.ads.adFrequency)}
                                            onValueChange={(val) => updateConfig("ads", "adFrequency", Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Show on every click (Aggressive)</SelectItem>
                                                <SelectItem value="2">Every 2nd click</SelectItem>
                                                <SelectItem value="3">Every 3rd click (Balanced)</SelectItem>
                                                <SelectItem value="5">Every 5th click (Mild)</SelectItem>
                                                <SelectItem value="10">Every 10th click</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">How often interstitial ads appear.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Banner Position</Label>
                                        <Select
                                            value={config.ads.bannerPosition}
                                            onValueChange={(val) => updateConfig("ads", "bannerPosition", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top">Top</SelectItem>
                                                <SelectItem value="bottom">Bottom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Rewared Video Reward</Label>
                                        <Select
                                            value={config.ads.rewardedVideoReward}
                                            onValueChange={(val) => updateConfig("ads", "rewardedVideoReward", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select reward" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1h">1 Hour Premium</SelectItem>
                                                <SelectItem value="24h">24 Hours Premium</SelectItem>
                                                <SelectItem value="7d">7 Days Premium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Length of premium access granted for watching an ad.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
