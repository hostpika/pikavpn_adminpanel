"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Shield } from "lucide-react"

export default function SubscriptionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Subscription</h1>
                <p className="text-muted-foreground">Manage your plan and billing details</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Current Plan */}
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Free Plan
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Current</span>
                        </CardTitle>
                        <CardDescription>Your current active plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 10 Free Servers</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Standard Speed</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 1 Device</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>Active</Button>
                    </CardFooter>
                </Card>

                {/* Upgrade Option */}
                <Card className="border-2 border-primary shadow-lg scale-105">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-primary">
                            Premium Plan
                            <Shield className="h-5 w-5" />
                        </CardTitle>
                        <CardDescription>Unlock full potential</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 150+ Servers</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Speed</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 5 Devices</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> No Ads</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Upgrade Now</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
