"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const user = await authService.signIn(email, password)

      if (user.role === "admin") {
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        })
        router.push("/dashboard")
      } else {
        toast.success("Welcome!", {
          description: "You have successfully signed in.",
        })
        router.push("/user-dashboard")
      }

      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      })
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      let message = "Invalid email or password. Please try again."

      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = "Invalid email or password."
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later."
      }

      toast.error("Login Failed", {
        description: message,
      })
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      const user = await authService.signInWithGoogle()

      if (user.role === "admin") {
        toast.success("Welcome back!", {
          description: "You have successfully signed in with Google.",
        })
        router.push("/dashboard")
      } else {
        toast.success("Welcome!", {
          description: "You have successfully signed in with Google.",
        })
        router.push("/user-dashboard")
      }

      toast.success("Welcome back!", {
        description: "You have successfully signed in with Google.",
      })
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Google login error:", err)

      if (err.message && err.message.includes("Access Restricted")) {
        toast.error("Login Failed", {
          description: err.message,
        })
      } else if (err.code === 'auth/popup-blocked') {
        toast.error("Login Failed", {
          description: "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.",
        })
      } else {
        toast.error("Login Failed", {
          description: "Failed to sign in with Google. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
<<<<<<< HEAD
            <CardDescription className="text-base mt-2">Sign in to access the Pika VPN admin panel</CardDescription>
=======
            <CardDescription className="text-base mt-2">Sign in to access the FreeShield VPN Pro admin panel</CardDescription>
>>>>>>> 4ab9dcfdfc30a971726512fce40f65b77005d691
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="admin@cloudvpn.com" required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4" >
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full h-11" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.54z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
