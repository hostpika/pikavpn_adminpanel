"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    X,
    CreditCard,
    Tag,
    CheckCircle2,
    Sparkles,
    Shield
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminAlert } from "@/components/admin-alert"

interface Plan {
    id: string
    name: string
    price: number
    currency: string
    interval: "month" | "year" | "week"
    googleProductId: string
    features: string[]
    isActive: boolean
    popular: boolean
}

export default function SubscriptionsConfigPage() {
    const { user } = useAuth()
    const isAdmin = user?.role === "admin"
    const { toast } = useToast()

    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({
        name: "",
        price: 0,
        currency: "USD",
        interval: "month",
        googleProductId: "",
        features: [],
        isActive: true,
        popular: false
    })
    const [featuresInput, setFeaturesInput] = useState("")

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/subscriptions")
            const data = await res.json()
            if (data.plans) {
                setPlans(data.plans)
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error)
            toast({
                title: "Error",
                description: "Failed to load subscription plans.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (plan?: Plan) => {
        if (plan) {
            setCurrentPlan(plan)
            setFeaturesInput(plan.features?.join("\n") || "")
        } else {
            setCurrentPlan({
                name: "",
                price: 9.99,
                currency: "USD",
                interval: "month",
                googleProductId: "",
                features: [],
                isActive: true,
                popular: false
            })
            setFeaturesInput("- Ad-free experience\n- Fast connection\n- Premium locations")
        }
        setIsDialogOpen(true)
    }

    const handleSavePlan = async () => {
        try {
            if (!currentPlan.name || !currentPlan.googleProductId) {
                toast({
                    title: "Validation Error",
                    description: "Name and Google Product ID are required.",
                    variant: "destructive"
                })
                return
            }

            const featuresList = featuresInput
                .split("\n")
                .map(f => f.trim())
                .filter(f => f.length > 0)

            const payload = {
                ...currentPlan,
                features: featuresList,
                price: Number(currentPlan.price) // Ensure number
            }

            const method = currentPlan.id ? "PUT" : "POST"
            const res = await fetchWithAuth("/api/subscriptions", {
                method,
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to save plan")

            toast({
                title: "Success",
                description: `Plan ${currentPlan.id ? "updated" : "created"} successfully.`
            })

            setIsDialogOpen(false)
            fetchPlans()
        } catch (error) {
            console.error("Save error:", error)
            toast({
                title: "Error",
                description: "Failed to save plan settings.",
                variant: "destructive"
            })
        }
    }

    const handleDeletePlan = async () => {
        if (!currentPlan.id) return

        try {
            const res = await fetchWithAuth(`/api/subscriptions?id=${currentPlan.id}`, {
                method: "DELETE"
            })

            if (!res.ok) throw new Error("Failed to delete plan")

            toast({
                title: "Success",
                description: "Plan deleted successfully."
            })

            setIsDeleteDialogOpen(false)
            fetchPlans()
        } catch (error) {
            console.error("Delete error:", error)
            toast({
                title: "Error",
                description: "Failed to delete plan.",
                variant: "destructive"
            })
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">Manage and customize your VPN pricing tiers.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        New Plan
                    </Button>
                )}
            </div>

            {!isAdmin && <AdminAlert message="You need permission to modify subscription plans." />}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            "relative group flex flex-col rounded-[2rem] border p-8 transition-all duration-300 hover:scale-[1.02] dark:border-white/10 dark:bg-white/5",
                            plan.popular
                                ? "bg-gradient-to-b from-primary/10 to-transparent border-primary/20 shadow-xl shadow-primary/10 dark:from-primary/20"
                                : "bg-card/50 backdrop-blur-sm border-border/50 hover:border-border/80 hover:shadow-lg",
                            !plan.isActive && "opacity-60 grayscale"
                        )}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm ring-4 ring-background">
                                    <Sparkles className="h-3 w-3" />
                                    Best Value
                                </span>
                            </div>
                        )}

                        {/* Status Badge */}
                        {!plan.isActive && (
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="rounded-full px-2.5">Inacitve</Badge>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                {plan.name}
                                {plan.interval === "year" && <Badge variant="outline" className="rounded-full text-[10px] h-5 px-2">Save 20%</Badge>}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight">{plan.currency === "USD" ? "$" : plan.currency} {plan.price}</span>
                                <span className="text-muted-foreground font-medium">/{plan.interval}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-mono">{plan.googleProductId}</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            <div className="h-px bg-border/50" />
                            <ul className="space-y-3">
                                {plan.features?.slice(0, 5).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                        <span className="text-muted-foreground leading-tight">{feature}</span>
                                    </li>
                                ))}
                                {plan.features && plan.features.length > 5 && (
                                    <li className="text-xs text-muted-foreground pl-8 pt-1">
                                        +{plan.features.length - 5} more benefits
                                    </li>
                                )}
                            </ul>
                        </div>

                        {isAdmin && (
                            <div className="mt-auto pt-4 flex gap-3">
                                <Button
                                    onClick={() => handleOpenDialog(plan)}
                                    className={cn(
                                        "flex-1 rounded-xl h-11 font-medium shadow-none transition-transform active:scale-95",
                                        plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Plan
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        setCurrentPlan(plan)
                                        setIsDeleteDialogOpen(true)
                                    }}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{currentPlan.id ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                        <DialogDescription>
                            Configure subscription details. Ensure "Product ID" matches Google Play Console.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Plan Name</Label>
                                <Input
                                    placeholder="e.g. Monthly Premium"
                                    value={currentPlan.name}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Google Product ID</Label>
                                <Input
                                    placeholder="e.g. vpn_premium_monthly"
                                    value={currentPlan.googleProductId}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, googleProductId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    placeholder="9.99"
                                    value={currentPlan.price}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Input
                                    placeholder="USD"
                                    value={currentPlan.currency}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, currency: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Interval</Label>
                                <Select
                                    value={currentPlan.interval}
                                    onValueChange={(val: any) => setCurrentPlan({ ...currentPlan, interval: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">Weekly</SelectItem>
                                        <SelectItem value="month">Monthly</SelectItem>
                                        <SelectItem value="year">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Features (One per line)</Label>
                            <Textarea
                                rows={5}
                                placeholder="- High speed servers..."
                                value={featuresInput}
                                onChange={(e) => setFeaturesInput(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                            <div className="flex flex-col space-y-1">
                                <Label>Active Status</Label>
                                <span className="text-xs text-muted-foreground">Visible in app</span>
                            </div>
                            <Switch
                                checked={currentPlan.isActive}
                                onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, isActive: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                            <div className="flex flex-col space-y-1">
                                <Label>Popular Badge</Label>
                                <span className="text-xs text-muted-foreground">Highlight as "Best Value"</span>
                            </div>
                            <Switch
                                checked={currentPlan.popular}
                                onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, popular: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSavePlan}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <strong>{currentPlan.name}</strong> plan.
                            Make sure to also remove it from Google Play Console if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeletePlan}>
                            Delete Plan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
