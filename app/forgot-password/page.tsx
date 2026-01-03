"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2, ArrowLeft, Mail } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await authService.sendPasswordResetEmail(email)
            setIsSubmitted(true)
            toast.success("Reset link sent!", {
                description: "Check your email for instructions to reset your password.",
            })
        } catch (err: any) {
            console.error("Reset password error:", err)
            let message = "Failed to send reset email. Please try again."

            if (err.code === 'auth/user-not-found') {
                // For security reasons, we might want to show the same success message or a generic error
                // But for admin panels, sometimes specific info is helpful. 
                // Best practice: "If an account exists, an email has been sent."
                // However, standard feedback for this user request might prefer clarity.
                message = "Account not found."
            } else if (err.code === 'auth/invalid-email') {
                message = "Invalid email address."
            }

            toast.error("Error", {
                description: message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0f0f2a] p-4">
                <div className="gradient-mesh absolute inset-0 opacity-40" />
                <Card className="w-full max-w-md relative z-10 border-2">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription className="text-base mt-2">
                            We have sent a password reset link to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/login">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0f0f2a] p-4">
            <div className="gradient-mesh absolute inset-0 opacity-40" />

            <Card className="w-full max-w-md relative z-10 border-2">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@cloudvpn.com"
                                required
                                className="h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>

                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
