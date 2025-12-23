"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Download, Zap, Crown } from "lucide-react"

export default function UserDashboardPage() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.displayName || "User"}! Here is an overview of your account.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            Free Plan
                            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-normal">Upgrade</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Limited access to servers.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2 GB</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Consumed this month.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">App Download</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Get App</div>
                        <p className="text-xs text-muted-foreground mt-1 mb-3">
                            Download for customized experience.
                        </p>
                        <Button size="sm" className="w-full">Download Now</Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-primary" />
                        <CardTitle>Upgrade to Premium</CardTitle>
                    </div>
                    <CardDescription>
                        Unlock all servers, faster speeds, and remove ads.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" className="w-full sm:w-auto">Upgrade Now</Button>
                </CardContent>
            </Card>
        </div>
    )
}
