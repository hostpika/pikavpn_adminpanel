"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Ban, ShieldCheck, Speaker } from "lucide-react"
import { useConfig } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"
import { toast } from "sonner"
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

export default function AdsConfigPage() {
    const { config, loading, hasChanges, updateConfig, saveConfig, saving, getChanges } = useConfig()
    const { user } = useAuth()
    const isAdmin = user?.role === "admin"

    const [showPublishDialog, setShowPublishDialog] = useState(false)

    // Ensure we have at least one profile initialized locally if missing for UI binding
    const ads = config.ads || { profiles: [], settings: {} }
    const profile = ads.profiles?.[0] || {
        id: "default",
        name: "Default Profile",
        provider: "admob",
        admob: { appId: "", bannerId: "", interstitialId: "", nativeId: "", openAppId: "", rewardedId: "" },
        facebook: { appId: "", bannerId: "", interstitialId: "", nativeId: "", rewardedId: "" }
    }

    const changes = showPublishDialog ? getChanges() : []

    const updateProfileField = (field: string, value: any) => {
        const updatedProfiles = [...(ads.profiles || [])]
        if (updatedProfiles.length === 0) {
            updatedProfiles.push(profile)
        }

        const currentProfile = { ...updatedProfiles[0] }

        if (field === "provider") {
            currentProfile.provider = value
        } else if (field.startsWith("admob.")) {
            const key = field.split(".")[1]
            currentProfile.admob = { ...currentProfile.admob, [key]: value }
        } else if (field.startsWith("facebook.")) {
            const key = field.split(".")[1]
            currentProfile.facebook = { ...currentProfile.facebook, [key]: value }
        }

        updatedProfiles[0] = currentProfile
        updateConfig("ads", "profiles", updatedProfiles)
    }

    const updateSetting = (key: string, value: any) => {
        updateConfig("ads", "settings", { ...ads.settings, [key]: value })
    }

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
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ads Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage ad network IDs and global display rules</p>
                </div>

                <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={!hasChanges || saving || !isAdmin}
                            className="shadow-md transition-all active:scale-95"
                            size="lg"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Publish Configuration
                            {hasChanges && <Badge variant="secondary" className="ml-2">Draft</Badge>}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>Review Changes</DialogTitle>
                            <DialogDescription>Apply the following ad configuration updates.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/20">
                            {changes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No changes detected.</p>
                            ) : (
                                <div className="space-y-4">
                                    {changes.map((change, i) => (
                                        <div key={i} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="font-medium text-sm text-primary break-all">
                                                {change.path.replace("ads.", "").replace("profiles[0].", "Ad Network > ")}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-muted p-2 rounded text-muted-foreground break-all border">
                                                    <span className="font-semibold block mb-1 text-red-500/70">Old:</span>
                                                    {String(change.oldValue)}
                                                </div>
                                                <div className="bg-muted p-2 rounded text-foreground break-all border border-green-500/20">
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
                            <Button onClick={handlePublish} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Confirm & Publish
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <AdminAlert message="You need permission to modify advertising settings." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Active Provider Selection */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Ad Network Selection
                            </CardTitle>
                            <CardDescription>Choose the primary ad network to display in the app</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={profile.provider}
                                onValueChange={(val) => updateProfileField("provider", val)}
                                className="grid grid-cols-3 gap-4"
                            >
                                <div className="space-y-2">
                                    <RadioGroupItem value="admob" id="prov-admob" className="peer sr-only" />
                                    <Label
                                        htmlFor="prov-admob"
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 ${profile.provider === 'admob' ? 'border-primary bg-background shadow-sm ring-1 ring-primary/20' : 'border-transparent bg-muted/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${profile.provider === 'admob' ? 'bg-primary text-white' : 'bg-muted-foreground/20'}`}>
                                            G
                                        </div>
                                        <span className="font-semibold text-sm">Google AdMob</span>
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <RadioGroupItem value="facebook" id="prov-fb" className="peer sr-only" />
                                    <Label
                                        htmlFor="prov-fb"
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 ${profile.provider === 'facebook' ? 'border-primary bg-background shadow-sm ring-1 ring-primary/20' : 'border-transparent bg-muted/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${profile.provider === 'facebook' ? 'bg-indigo-600 text-white' : 'bg-muted-foreground/20'}`}>
                                            M
                                        </div>
                                        <span className="font-semibold text-sm">Meta Audience</span>
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <RadioGroupItem value="none" id="prov-none" className="peer sr-only" />
                                    <Label
                                        htmlFor="prov-none"
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 ${profile.provider === 'none' ? 'border-destructive bg-background shadow-sm ring-1 ring-destructive/20' : 'border-transparent bg-muted/50'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full mb-2 flex items-center justify-center bg-muted-foreground/20">
                                            <Ban className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-sm text-destructive">Disabled</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Conditional Provider Configuration */}
                    {profile.provider === "admob" ? (
                        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                                    AdMob Settings
                                </CardTitle>
                                <CardDescription>Configure your Google AdMob integration</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="admob-appId">Application ID</Label>
                                    <Input
                                        id="admob-appId"
                                        value={profile.admob.appId}
                                        onChange={(e) => updateProfileField("admob.appId", e.target.value)}
                                        placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                                        className="font-mono text-sm"
                                    />
                                </div>
                                {[
                                    { key: "openAppId", label: "App Open ID" },
                                    { key: "bannerId", label: "Banner Placement ID" },
                                    { key: "interstitialId", label: "Interstitial Placement ID" },
                                    { key: "nativeId", label: "Native Advanced ID" },
                                    { key: "rewardedId", label: "Rewarded Video ID" }
                                ].map((unit) => (
                                    <div key={unit.key} className="space-y-2">
                                        <Label htmlFor={`admob-${unit.key}`}>{unit.label}</Label>
                                        <Input
                                            id={`admob-${unit.key}`}
                                            value={(profile.admob as any)[unit.key]}
                                            onChange={(e) => updateProfileField(`admob.${unit.key}`, e.target.value)}
                                            placeholder="ca-app-pub-..."
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : profile.provider === "facebook" ? (
                        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                    Meta Audience Network
                                </CardTitle>
                                <CardDescription>Configure Meta/Facebook Audience Network IDs</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="fb-appId">Application ID</Label>
                                    <Input
                                        id="fb-appId"
                                        value={profile.facebook.appId}
                                        onChange={(e) => updateProfileField("facebook.appId", e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                {[
                                    { key: "bannerId", label: "Banner Placement ID" },
                                    { key: "interstitialId", label: "Interstitial Placement ID" },
                                    { key: "nativeId", label: "Native Placement ID" },
                                    { key: "rewardedId", label: "Rewarded Placement ID" }
                                ].map((unit) => (
                                    <div key={unit.key} className="space-y-2">
                                        <Label htmlFor={`fb-${unit.key}`}>{unit.label}</Label>
                                        <Input
                                            id={`fb-${unit.key}`}
                                            value={(profile.facebook as any)[unit.key]}
                                            onChange={(e) => updateProfileField(`facebook.${unit.key}`, e.target.value)}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed bg-muted/20 animate-in fade-in zoom-in-95 duration-300">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Ban className="w-10 h-10 mb-4 opacity-20" />
                                <p className="text-sm font-medium">Ads are currently disabled</p>
                                <p className="text-xs mt-1">Select a provider above to enable advertising</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Global Rules */}
                <div className="space-y-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Speaker className="w-5 h-5 text-primary" />
                                Global Settings
                            </CardTitle>
                            <CardDescription>Rules applied at app runtime</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-tight">Ad Frequency</Label>
                                <Select
                                    value={String(ads.settings?.adFrequency || 3)}
                                    onValueChange={(val) => updateSetting("adFrequency", Number(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Show every time</SelectItem>
                                        <SelectItem value="2">Show every 2nd time</SelectItem>
                                        <SelectItem value="3">Show every 3rd time</SelectItem>
                                        <SelectItem value="5">Show every 5th time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-tight">Banner Position</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["top", "bottom"].map((pos) => (
                                        <Button
                                            key={pos}
                                            variant={ads.settings?.bannerPosition === pos ? "default" : "outline"}
                                            size="sm"
                                            className="capitalize"
                                            onClick={() => updateSetting("bannerPosition", pos)}
                                        >
                                            {pos}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-tight">Rewarded Reward</Label>
                                <Select
                                    value={ads.settings?.rewardedVideoReward || "24h"}
                                    onValueChange={(val) => updateSetting("rewardedVideoReward", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Reward" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1h">1 Hour Premium</SelectItem>
                                        <SelectItem value="24h">24 Hours Premium</SelectItem>
                                        <SelectItem value="48h">48 Hours Premium</SelectItem>
                                        <SelectItem value="7d">7 Days Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded bg-primary/10">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                    Note: Changes here only affect the primary ad profile. The mobile client must be configured to fetch the first entry from the profiles array.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
