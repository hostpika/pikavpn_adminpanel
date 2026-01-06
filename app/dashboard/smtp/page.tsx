"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Toaster, toast } from "sonner"
import { Loader2, Save, Trash2, Mail, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
<<<<<<< HEAD
import { Label } from "@/components/ui/label"
=======
>>>>>>> 7a035c84ef42d82ade25079c5900e34b350d176f
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

import { useAuth } from "@/components/auth-provider"

const formSchema = z.object({
    host: z.string().min(1, "Host is required"),
    port: z.string().min(1, "Port is required"),
    username: z.string().optional(),
    password: z.string().optional(),
    encryption: z.string().optional(),
    fromEmail: z.string().email("Invalid email address"),
    fromName: z.string().optional(),
})

export default function SmtpPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
<<<<<<< HEAD
    const [testing, setTesting] = useState(false)
=======
>>>>>>> 7a035c84ef42d82ade25079c5900e34b350d176f
    const [isAdmin, setIsAdmin] = useState(false) // Inferred from API or Auth
    const { user } = useAuth()

    // We can try to guess admin status from user claims if available, 
    // but for now we'll rely on the API response behavior or just assume user might be admin until API fails 
    // or checks.
    // Actually, let's use the fact that if we receive masked data, we are not admin.
    // Or check user.claims if exposed. For now, let's assume we can try to save if fields are editable.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            host: "",
            port: "",
            username: "",
            password: "",
            encryption: "none",
            fromEmail: "",
            fromName: "",
        },
    })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("backend_token")
            const response = await fetch("/api/admin/smtp", {
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.host) {
                    form.reset({
                        host: data.host,
                        port: data.port,
                        username: data.username,
                        password: data.password,
                        encryption: data.encryption || "none",
                        fromEmail: data.fromEmail,
                        fromName: data.fromName,
                    })
                }

                // If we have a token and the response is OK, we can check visibility
                // If data is masked, we are not admin (or at least valid admin for this resource)
                const isMasked = data.username === "********" || data.password === "********"
                setIsAdmin(!isMasked)
                // Note: This logic is a bit loose because an admin could set password to "********" genuinely, 
                // but practically it works for UI state. 
                // Better: The API could return a flag, but we didn't add it.
                // Actually, let's just show the form. If the user is not admin, they will see masked data.
                // If they try to save, it will fail (403).

                // Wait, if it's masked, we should probably disable the inputs so they don't accidentally save "********"
                if (isMasked) {
                    // Disable form? Or just visual indication?
                    // The requirement says "data inside fields should be visible to only admins".
                    // It also says "only admin will be able to edit/delete".
                }
            } else if (response.status === 403) {
                setIsAdmin(false)
            }
        } catch (error) {
            console.error("Failed to fetch SMTP config", error)
            toast.error("Failed to load configuration")
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setSaving(true)
            const token = localStorage.getItem("backend_token")
            const response = await fetch("/api/admin/smtp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(values),
            })

            if (response.ok) {
                toast.success("SMTP configuration saved successfully")
                // Refresh to ensure we have latest state
                fetchConfig()
            } else {
                const errorData = await response.json()
                if (response.status === 403) {
                    toast.error("You do not have permission to edit this configuration")
                } else {
                    toast.error(errorData.error || "Failed to save configuration")
                }
            }
        } catch (error) {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

<<<<<<< HEAD
    const handleTest = async (testEmail: string) => {
        if (!testEmail) {
            toast.error("Please enter an email address to send the test to.")
            return
        }

        try {
            setTesting(true)
            const token = localStorage.getItem("backend_token")
            const values = form.getValues()

            // If password is masked (********), and we haven't changed it, 
            // we can't really test with it because the client doesn't know the real password.
            // We'll have to rely on the backend to pull it if it's not changed?
            // Actually, for security, testing usually requires inputting the password if it's not saved yet,
            // OR the backend needs to handle "if password is ****, use existing from DB".
            // Let's check how our verifySmtpConfig works. It takes the config passed to it.
            // So if we pass "****", it will fail.
            // We should probably warn the user or prompt for password if it's masked.

            // However, implementing "use stored password if masked" in the test endpoint is complex without refetching logic inside the endpoint.
            // Let's try to just send what we have. If it's masked, the user probably needs to re-enter it to test changes.
            // If they are just testing existing config, maybe we can support that later. 
            // For now, let's assume they might need to re-enter password if it's masked.

            // Actually, let's allow the backend to handle it? 
            // No, the backend `verifySmtpConfig` takes explicit config.
            // So we'll act as if this is a "Test New Settings" feature mostly.

            const response = await fetch("/api/admin/smtp/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    config: values,
                    toEmail: testEmail
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                toast.success("Connection successful! Test email sent.")
            } else {
                toast.error(`Connection failed: ${data.error || "Unknown error"}`)
            }
        } catch (error) {
            toast.error("An error occurred while testing connection")
        } finally {
            setTesting(false)
        }
    }

=======
>>>>>>> 7a035c84ef42d82ade25079c5900e34b350d176f
    const handleDelete = async () => {
        try {
            setDeleting(true)
            const token = localStorage.getItem("backend_token")
            const response = await fetch("/api/admin/smtp", {
                method: "DELETE",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            })

            if (response.ok) {
                toast.success("Configuration deleted")
                form.reset({
                    host: "",
                    port: "",
                    username: "",
                    password: "",
                    encryption: "none",
                    fromEmail: "",
                    fromName: "",
                })
            } else {
                if (response.status === 403) {
                    toast.error("You do not have permission to delete this configuration")
                } else {
                    toast.error("Failed to delete configuration")
                }
            }
        } catch (error) {
            toast.error("An error occurred while deleting")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">SMTP Configuration</h2>
                    <p className="text-muted-foreground">
                        Configure your email server settings for sending system emails.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Server Settings
                            </CardTitle>
                            <CardDescription>
                                Enter the connection details for your SMTP provider.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="host"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Host</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="smtp.example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="port"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Port</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="587" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="user@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="encryption"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Encryption</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select encryption" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="ssl">SSL</SelectItem>
                                                        <SelectItem value="tls">TLS</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="fromEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>From Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="noreply@yourdomain.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fromName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sender Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="VPN Admin" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        {/* Delete Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" type="button" disabled={deleting || !isAdmin}>
                                                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                    Delete Config
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your SMTP configuration.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <Button type="submit" disabled={saving || !isAdmin}>
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Changes
                                        </Button>
<<<<<<< HEAD

                                    </div>

                                    {/* Test Connection Dialog */}
                                    <div className="pt-4 border-t">
                                        <h3 className="text-sm font-medium mb-3">Test Configuration</h3>
                                        <div className="flex gap-4 items-end">
                                            <div className="grid gap-2 flex-1">
                                                <Label htmlFor="testEmail">Target Email</Label>
                                                <Input
                                                    id="testEmail"
                                                    placeholder="Enter your personal email"
                                                    defaultValue={user?.email || ""}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={testing || !isAdmin}
                                                onClick={() => {
                                                    const emailInput = document.getElementById("testEmail") as HTMLInputElement
                                                    handleTest(emailInput?.value)
                                                }}
                                            >
                                                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                                Test Connection
                                            </Button>
                                        </div>
=======
>>>>>>> 7a035c84ef42d82ade25079c5900e34b350d176f
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {!isAdmin && (
                        <div className="rounded-md bg-yellow-500/10 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ShieldAlert className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-500">Read-only Access</h3>
                                    <div className="mt-2 text-sm text-yellow-500/90">
                                        <p>
                                            You are viewing this configuration in read-only mode. Sensitive details are hidden and you cannot make changes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Card className="bg-muted/50 border-muted">
                        <CardHeader>
                            <CardTitle className="text-lg">Gmail SMTP Guide</CardTitle>
                            <CardDescription>How to configure Gmail for sending emails</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">1. Host & Port</h4>
                                <div className="text-sm text-muted-foreground p-3 rounded-md bg-background border">
                                    <div className="flex justify-between">
                                        <span>Host:</span>
                                        <span className="font-mono text-foreground">smtp.gmail.com</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Port:</span>
                                        <span className="font-mono text-foreground">587</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Encryption:</span>
                                        <span className="font-mono text-foreground">TLS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">2. Authentication</h4>
                                <p className="text-sm text-muted-foreground">
                                    Do <strong>not</strong> use your regular Gmail password. You must use an App Password.
                                </p>

                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-1">
                                    <li>Go to your Google Account settings.</li>
                                    <li>Enable <strong>2-Step Verification</strong> if not already enabled.</li>
                                    <li>Search for <strong>"App passwords"</strong>.</li>
                                    <li>Create a new app password (name it "VPN Admin" or similar).</li>
                                    <li>Copy the 16-character code.</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">3. Username</h4>
                                <p className="text-sm text-muted-foreground">
                                    Use your full Gmail address (e.g., <code>yourname@gmail.com</code>).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Troubleshooting</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
                                    <li>Check if 2-Step Verification is on.</li>
                                    <li>Ensure you are using the App Password, not login password.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
<<<<<<< HEAD

                    <Card className="bg-muted/50 border-muted mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Business Email</CardTitle>
                            <CardDescription>Custom SMTP (Zoho, cPanel, Outlook)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>You can use any business email provider.</p>
                                <ul className="list-disc list-inside space-y-1 ml-1 mt-2">
                                    <li><strong>Host:</strong> Usually `mail.yourdomain.com` or `smtp.office365.com`</li>
                                    <li><strong>Port:</strong> 465 (SSL) or 587 (TLS)</li>
                                    <li><strong>Username:</strong> Full email address</li>
                                </ul>
                                <p className="mt-2 text-xs italic">Use the "Test Connection" button below to verify settings before saving.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </div >
        </div >
=======
                </div>
            </div>
        </div>
>>>>>>> 7a035c84ef42d82ade25079c5900e34b350d176f
    )
}
