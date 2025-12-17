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
    Tag
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
                    <p className="text-muted-foreground">Manage pricing plans fetched by the Android app.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Plan
                    </Button>
                )}
            </div>

            {!isAdmin && <AdminAlert message="You need permission to modify subscription plans." />}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col ${!plan.isActive ? 'opacity-75 border-dashed' : ''} ${plan.popular ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    {plan.popular && (
                                        <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                            Most Popular
                                        </Badge>
                                    )}
                                    {!plan.isActive && (
                                        <Badge variant="secondary" className="mb-2 ml-2">
                                            Inactive
                                        </Badge>
                                    )}
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.googleProductId}</CardDescription>
                                </div>
                                {isAdmin && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => {
                                                    setCurrentPlan(plan)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <div>
                                <span className="text-3xl font-bold">{plan.currency} {plan.price}</span>
                                <span className="text-muted-foreground"> / {plan.interval}</span>
                            </div>

                            <div className="space-y-2 flex-1">
                                {plan.features?.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="flex items-center text-sm">
                                        <Check className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                                        {feature}
                                    </div>
                                ))}
                                {plan.features?.length > 4 && (
                                    <p className="text-xs text-muted-foreground pl-6">
                                        +{plan.features.length - 4} more features
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
