"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Loader2 } from "lucide-react"
import { useConfig } from "@/hooks/use-config"

export default function SubscriptionsConfigPage() {
    const { loading } = useConfig()

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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-muted-foreground">Subscription Plan Management</p>
                </div>

                <div className="p-8 border rounded-md bg-muted/50 text-center">
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                        Subscription plan management and payment gateway configuration features are currently under development.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    )
}
