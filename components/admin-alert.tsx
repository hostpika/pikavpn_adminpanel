"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface AdminAlertProps {
    title?: string
    message?: string
}

export function AdminAlert({ title = "Read Only Access", message = "You are logged in as a standard user. Only administrators can make changes to the system configuration and data." }: AdminAlertProps) {
    const { user, loading } = useAuth()

    if (loading || !user || user.role === "admin") {
        return null
    }

    return (
        <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {message}
            </AlertDescription>
        </Alert>
    )
}
