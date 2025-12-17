"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface ConfigState {
    features: {
        killswitch: boolean
        splitTunnel: boolean
        autoReconnect: boolean
        ads: boolean
        subscriptions: boolean
        experimental: boolean
    }
    vpn: {
        connectionTimeout: number
        reconnectAttempts: number
        reconnectDelay: number
        protocol: string
        customDns: string
    }
    ui: {
        primaryColor: string
        accentColor: string
        appName: string
        logoUrl: string
        showcaseText: string
    }
    ads: {
        activeProvider: "admob" | "facebook" | "none"
        // AdMob
        admobAppId: string
        admobBannerId: string
        admobInterstitialId: string
        admobNativeId: string
        admobOpenAppId: string
        admobRewardedId: string

        // Facebook Audience Network
        fanAppId: string
        fanBannerId: string
        fanInterstitialId: string
        fanNativeId: string
        fanRewardedId: string

        // General
        adFrequency: number
        bannerPosition: string
        rewardedVideoReward: string
    }
    version: {
        currentVersion: string
        minimumVersion: string
        forceUpdate: string
        updateMessage: string
    }
}

const defaultConfig: ConfigState = {
    features: {
        killswitch: true,
        splitTunnel: true,
        autoReconnect: true,
        ads: true,
        subscriptions: true,
        experimental: false,
    },
    vpn: {
        connectionTimeout: 30,
        reconnectAttempts: 3,
        reconnectDelay: 5,
        protocol: "auto",
        customDns: "8.8.8.8, 8.8.4.4",
    },
    ui: {
        primaryColor: "#3b82f6",
        accentColor: "#06b6d4",
        appName: "SuperVPN Pro",
        logoUrl: "https://example.com/logo.png",
        showcaseText: "Fast and secure VPN connections worldwide. Protect your privacy with military-grade encryption.",
    },
    ads: {
        activeProvider: "admob",

        // AdMob Defaults
        admobAppId: "",
        admobBannerId: "",
        admobInterstitialId: "",
        admobNativeId: "",
        admobOpenAppId: "",
        admobRewardedId: "",

        // FAN Defaults
        fanAppId: "",
        fanBannerId: "",
        fanInterstitialId: "",
        fanNativeId: "",
        fanRewardedId: "",

        adFrequency: 3,
        bannerPosition: "bottom",
        rewardedVideoReward: "24 hours ad-free experience",
    },
    version: {
        currentVersion: "2.5.0",
        minimumVersion: "2.0.0",
        forceUpdate: "disabled",
        updateMessage: "Please update to the latest version for the best experience.",
    },
}

export function useConfig() {
    const { toast } = useToast()
    const [config, setConfig] = useState<ConfigState>(defaultConfig)
    const [loading, setLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/config")
            if (res.ok) {
                const data = await res.json()
                if (data && Object.keys(data).length > 0) {
                    setConfig(prev => ({
                        ...prev,
                        ...data,
                        features: { ...prev.features, ...data.features },
                        vpn: { ...prev.vpn, ...data.vpn },
                        ui: { ...prev.ui, ...data.ui },
                        ads: { ...prev.ads, ...data.ads },
                        version: { ...prev.version, ...data.version },
                    }))
                }
            }
        } catch (error) {
            console.error("Error fetching config:", error)
            toast({ title: "Error", description: "Failed to load configuration", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchConfig()
    }, [fetchConfig])

    const updateConfig = (section: keyof ConfigState, key: string, value: any) => {
        setConfig((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }))
        setHasChanges(true)
    }

    const saveConfig = async () => {
        try {
            setSaving(true)
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })

            if (!res.ok) throw new Error("Failed to save")

            setHasChanges(false)
            toast({ title: "Success", description: "Configuration published successfully" })
            return true
        } catch (error) {
            console.error("Error saving config:", error)
            toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" })
            return false
        } finally {
            setSaving(false)
        }
    }

    return { config, loading, hasChanges, updateConfig, saveConfig, saving }
}
