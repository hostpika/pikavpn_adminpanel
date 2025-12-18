"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Megaphone, Ban, Plus, Trash2, Check, Copy } from "lucide-react"
import { useConfig, AdProfile } from "@/hooks/use-config"
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

    // Local state for dialogs
    const [profileToDelete, setProfileToDelete] = useState<string | null>(null)
    const [profileToDuplicate, setProfileToDuplicate] = useState<AdProfile | null>(null)
    const [showPublishDialog, setShowPublishDialog] = useState(false)

    // Accordions state: open the active profile by default
    const [openItem, setOpenItem] = useState<string>("")

    useEffect(() => {
        if (!loading && config.ads?.activeProfileId && !openItem) {
            setOpenItem(config.ads.activeProfileId)
        }
    }, [loading, config.ads?.activeProfileId])


    const changes = showPublishDialog ? getChanges() : []
    const activeProfileId = config.ads?.activeProfileId

    const handleAddProfile = () => {
        const newId = uuidv4()
        const newProfile: AdProfile = {
            id: newId,
            name: `New Profile ${config.ads.profiles.length + 1}`,
            provider: "admob",
            admob: { appId: "", bannerId: "", interstitialId: "", nativeId: "", openAppId: "", rewardedId: "" },
            facebook: { appId: "", bannerId: "", interstitialId: "", nativeId: "", rewardedId: "" }
        }

        // Update config with new profile
        const updatedProfiles = [...(config.ads.profiles || []), newProfile]
        updateConfig("ads", "profiles", updatedProfiles)
        setOpenItem(newId) // Open the new profile
        toast.success("New ad profile created")
    }

    const confirmDeleteProfile = () => {
        if (!profileToDelete) return

        const updatedProfiles = config.ads.profiles.filter(p => p.id !== profileToDelete)
        updateConfig("ads", "profiles", updatedProfiles)
        setProfileToDelete(null)
        toast.success("Profile deleted")
    }

    const handleDeleteClick = (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation()
        if (config.ads.profiles.length <= 1) {
            toast.error("Cannot delete the last profile")
            return
        }

        if (profileId === config.ads.activeProfileId) {
            toast.error("Cannot delete the active profile")
            return
        }
        setProfileToDelete(profileId)
    }

    const updateProfile = (profileId: string, field: keyof AdProfile | string, value: any) => {
        const updatedProfiles = config.ads.profiles.map(p => {
            if (p.id === profileId) {
                if (field === "name" || field === "provider") {
                    return { ...p, [field]: value }
                }
                // Handle nested updates for admob/facebook
                if (field.startsWith("admob.")) {
                    const key = field.split(".")[1]
                    return { ...p, admob: { ...p.admob, [key]: value } }
                }
                if (field.startsWith("facebook.")) {
                    const key = field.split(".")[1]
                    return { ...p, facebook: { ...p.facebook, [key]: value } }
                }
            }
            return p
        })

        updateConfig("ads", "profiles", updatedProfiles)
    }

    const handleSetActive = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        updateConfig("ads", "activeProfileId", id)
        toast.success("Active profile updated")
    }

    const confirmDuplicateProfile = () => {
        if (!profileToDuplicate) return
        const newId = uuidv4()
        const duplicateProfile = {
            ...profileToDuplicate,
            id: newId,
            name: `${profileToDuplicate.name} (Copy)`
        }
        const updatedProfiles = [...config.ads.profiles, duplicateProfile]
        updateConfig("ads", "profiles", updatedProfiles)
        setOpenItem(newId)
        setProfileToDuplicate(null)
        toast.success("Profile duplicated")
    }

    const handleDuplicateClick = (e: React.MouseEvent, profile: AdProfile) => {
        e.stopPropagation()
        setProfileToDuplicate(profile)
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
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Advertising</h1>
                    <p className="text-muted-foreground">Manage ad networks and placements</p>
                </div>

                <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={!hasChanges || saving || !isAdmin}
                            className="bg-primary/90 hover:bg-primary shadow-lg hover:shadow-primary/25 transition-all duration-300"
                            size="lg"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Publish Changes
                            {hasChanges && (
                                <Badge variant="secondary" className="ml-2 bg-background/20 text-primary-foreground backdrop-blur-sm">
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
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/30">
                            {changes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No changes detected.</p>
                            ) : (
                                <div className="space-y-4">
                                    {changes.map((change, i) => {
                                        const formatPath = (path: string) => {
                                            return path
                                                .replace(/^ads\./, 'Ad Config > ')
                                                .replace(/\.profiles/, ' > Profiles')
                                                .replace(/\.settings/, ' > Settings')
                                                .replace(/\["([^"]+)"\]/g, ' > $1') // Remove brackets/quotes from names
                                                .replace(/\./g, ' > ')
                                                .replace(/_/g, ' ')
                                                .split(' > ')
                                                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                                                .join(' > ')
                                        }

                                        return (
                                            <div key={i} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                                                <div className="font-medium text-sm text-primary break-all">
                                                    {formatPath(change.path)}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-muted/50 p-2 rounded text-muted-foreground break-all border">
                                                        <span className="font-semibold block mb-1 text-red-500/70">Original:</span>
                                                        {String(change.oldValue)}
                                                    </div>
                                                    <div className="bg-muted/50 p-2 rounded text-foreground break-all border border-green-500/20 bg-green-500/5">
                                                        <span className="font-semibold block mb-1 text-green-500/70">New:</span>
                                                        {String(change.newValue)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
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

            <AdminAlert message="You need permission to modify advertising settings." />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Ad Profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this profile? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteProfile} className="bg-destructive hover:bg-destructive/90">
                            Delete Profile
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Duplicate Confirmation Dialog */}
            <AlertDialog open={!!profileToDuplicate} onOpenChange={(open) => !open && setProfileToDuplicate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Duplicate Ad Profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new copy of <strong>{profileToDuplicate?.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDuplicateProfile}>
                            Duplicate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Global Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <Card className="border-0 shadow-xl bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 ring-1 ring-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <ConfigIcon className="w-4 h-4" />
                                    </div>
                                    Global Settings
                                </CardTitle>
                                <CardDescription>Rules applied to all profiles</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Ad Frequency</Label>
                                    <Select
                                        value={String(config.ads?.settings?.adFrequency || 3)}
                                        onValueChange={(val) => updateConfig("ads", "settings", { ...config.ads.settings, adFrequency: Number(val) })}
                                    >
                                        <SelectTrigger className="bg-background/50 border-input/50 focus:ring-primary/20 transition-all">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Every click</SelectItem>
                                            <SelectItem value="2">Every 2nd click</SelectItem>
                                            <SelectItem value="3">Every 3rd click</SelectItem>
                                            <SelectItem value="5">Every 5th click</SelectItem>
                                            <SelectItem value="10">Every 10th click</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Frequency of interstitial ads.</p>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-3">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Banner Position</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={config.ads?.settings?.bannerPosition === "top" ? "default" : "outline"}
                                            size="sm"
                                            className="w-full"
                                            onClick={() => updateConfig("ads", "settings", { ...config.ads.settings, bannerPosition: "top" })}
                                        >
                                            Top
                                        </Button>
                                        <Button
                                            variant={config.ads?.settings?.bannerPosition === "bottom" ? "default" : "outline"}
                                            size="sm"
                                            className="w-full"
                                            onClick={() => updateConfig("ads", "settings", { ...config.ads.settings, bannerPosition: "bottom" })}
                                        >
                                            Bottom
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-3">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Rewarded Video</Label>
                                    <Select
                                        value={config.ads?.settings?.rewardedVideoReward || "24h"}
                                        onValueChange={(val) => updateConfig("ads", "settings", { ...config.ads.settings, rewardedVideoReward: val })}
                                    >
                                        <SelectTrigger className="bg-background/50 border-input/50 focus:ring-primary/20 transition-all">
                                            <SelectValue placeholder="Select reward" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1h">1 Hour Premium</SelectItem>
                                            <SelectItem value="24h">24 Hours Premium</SelectItem>
                                            <SelectItem value="7d">7 Days Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Premium time granted.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Content: Profiles Accordion */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Profiles
                            <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">
                                {config.ads.profiles.length}
                            </Badge>
                        </h2>
                        <Button onClick={handleAddProfile} className="gap-2 shadow-sm" variant="secondary">
                            <Plus className="h-4 w-4" /> Add Profile
                        </Button>
                    </div>

                    <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem} className="space-y-4">
                        {config.ads?.profiles?.map(profile => {
                            const isActive = profile.id === activeProfileId
                            return (
                                <AccordionItem
                                    key={profile.id}
                                    value={profile.id}
                                    className={`border rounded-xl px-4 transition-all duration-300 ${isActive
                                        ? "bg-primary/5 border-primary/20 shadow-sm"
                                        : "bg-card border-border/50 hover:border-primary/20 hover:bg-accent/30"
                                        } ${openItem === profile.id ? "shadow-md ring-1 ring-primary/10" : ""}`}
                                >
                                    <div className="flex items-center w-full">
                                        <AccordionTrigger className="hover:no-underline py-4 flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ring-4 ring-opacity-20 ${profile.provider === 'admob' ? 'bg-blue-500 ring-blue-500' :
                                                        profile.provider === 'facebook' ? 'bg-indigo-500 ring-indigo-500' :
                                                            'bg-gray-400 ring-gray-400'
                                                    }`} />
                                                <div className="text-left">
                                                    <div className="font-semibold flex items-center gap-2">
                                                        {profile.name}
                                                        {isActive && (
                                                            <Badge className="h-5 px-2 text-[10px] bg-primary text-primary-foreground pointer-events-none">
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground capitalize mt-0.5">
                                                        {profile.provider === "admob" ? "Google AdMob" : profile.provider === "facebook" ? "Meta Audience Network" : "Disabled"}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        {/* Actions moved outside the trigger to avoid button-in-button */}
                                        <div className="flex items-center gap-2 mr-4">
                                            {!isActive && (
                                                <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-primary/10 hover:text-primary" onClick={(e) => handleSetActive(e, profile.id)}>
                                                    Set Active
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <AccordionContent className="pt-2 pb-6 px-1">
                                        <div className="grid gap-6 pl-6 border-l-2 border-border/50 ml-2">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Profile Name</Label>
                                                    <Input
                                                        value={profile.name}
                                                        onChange={(e) => updateProfile(profile.id, "name", e.target.value)}
                                                        className="bg-background/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Ad Provider</Label>
                                                    <RadioGroup
                                                        value={profile.provider}
                                                        onValueChange={(val) => updateProfile(profile.id, "provider", val)}
                                                        className="grid grid-cols-3 gap-2"
                                                    >
                                                        {['admob', 'facebook', 'none'].map((p) => (
                                                            <div key={p}>
                                                                <RadioGroupItem value={p} id={`p-${profile.id}-${p}`} className="peer sr-only" />
                                                                <Label
                                                                    htmlFor={`p-${profile.id}-${p}`}
                                                                    className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs cursor-pointer hover:bg-accent ${profile.provider === p
                                                                        ? "border-primary bg-primary/5 text-primary"
                                                                        : "border-border bg-background text-muted-foreground"
                                                                        }`}
                                                                >
                                                                    {p === 'admob' && "AdMob"}
                                                                    {p === 'facebook' && "Meta"}
                                                                    {p === 'none' && "Disabled"}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            </div>

                                            <Separator className="my-2" />

                                            {profile.provider === "admob" && (
                                                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1 h-3 bg-blue-500 rounded-full" />
                                                        AdMob Units
                                                    </h4>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {['appId', 'openAppId', 'bannerId', 'interstitialId', 'nativeId', 'rewardedId'].map((key) => (
                                                            <div key={key} className="space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground capitalize">{key.replace(/Id$/, ' ID').replace(/([A-Z])/g, ' $1')}</Label>
                                                                <Input
                                                                    value={(profile.admob as any)[key]}
                                                                    onChange={(e) => updateProfile(profile.id, `admob.${key}`, e.target.value)}
                                                                    placeholder={`ca-app-pub-...`}
                                                                    className="font-mono text-xs bg-muted/30"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {profile.provider === "facebook" && (
                                                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1 h-3 bg-indigo-500 rounded-full" />
                                                        Audience Network Units
                                                    </h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">App ID</Label>
                                                            <Input
                                                                value={profile.facebook.appId}
                                                                onChange={(e) => updateProfile(profile.id, "facebook.appId", e.target.value)}
                                                                className="font-mono text-xs bg-muted/30"
                                                            />
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            {['bannerId', 'interstitialId', 'nativeId', 'rewardedId'].map((key) => (
                                                                <div key={key} className="space-y-1.5">
                                                                    <Label className="text-xs text-muted-foreground capitalize">{key.replace(/Id$/, ' Placement ID')}</Label>
                                                                    <Input
                                                                        value={(profile.facebook as any)[key]}
                                                                        onChange={(e) => updateProfile(profile.id, `facebook.${key}`, e.target.value)}
                                                                        className="font-mono text-xs bg-muted/30"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {profile.provider === "none" && (
                                                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground opacity-50 bg-muted/20 rounded-lg">
                                                    <Ban className="h-8 w-8 mb-2" />
                                                    <span className="text-sm">Ads are disabled for this profile</span>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button variant="outline" size="sm" onClick={(e) => handleDuplicateClick(e, profile)}>
                                                    <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                                                </Button>
                                                {!isActive && config.ads.profiles.length > 1 && (
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteClick(e, profile.id)}>
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </div>
            </div>
        </div>
    )
}

function ConfigIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
        </svg>
    )
}
