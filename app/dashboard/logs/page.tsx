"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Search, Filter, RefreshCw, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { AdminAlert } from "@/components/admin-alert"

interface LogEntry {
    id: string
    adminId: string
    adminEmail: string
    action: string
    targetType: string
    targetId: string
    targetName?: string
    details: string
    timestamp: string
    metadata?: any
}

export default function LogsPage() {
    const { toast } = useToast()
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState("all")
    const [adminFilter, setAdminFilter] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)

    const loadLogs = async () => {
        try {
            setLoading(true)
            let query = "/api/logs?limit=100"

            if (actionFilter && actionFilter !== "all") {
                query += `&action=${actionFilter}`
            }

            if (adminFilter) {
                query += `&admin=${encodeURIComponent(adminFilter)}`
            }

            if (date) {
                query += `&from=${date.toISOString()}`
            }

            const res = await fetchWithAuth(query)
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || "Failed to fetch logs")
            }
            const data = await res.json()
            setLogs(data.logs)
        } catch (error) {
            console.error("Error loading logs:", error)
            toast({
                title: "Error",
                description: (error as Error).message || "Failed to load activity logs",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [actionFilter, date]) // adminFilter triggers on enter/blur or separate search button usually, but here effect is ok if debounced. 
    // For simplicity, we'll make adminFilter search trigger on a button or blur, but here let's just trigger on mount and filter changes.
    // Actually, let's add a manual refresh button or effect on Enter for text input.

    const handleSearch = () => {
        loadLogs()
    }

    const getActionColor = (action: string) => {
        if (action.includes("CREATE")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        if (action.includes("DELETE") || action.includes("BAN")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        if (action.includes("UPDATE") || action.includes("SET")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">Monitor administrative actions and system history.</p>
            </div>

            <AdminAlert />

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>Recent actions performed by administrators.</CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" onClick={loadLogs} title="Refresh Logs">
                                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Admin Email..."
                                    className="pl-8"
                                    value={adminFilter}
                                    onChange={(e) => setAdminFilter(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="CREATE">Create</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                                <SelectItem value="BAN">Ban</SelectItem>
                                <SelectItem value="UNBAN">Unban</SelectItem>
                                <SelectItem value="SEND">Send Notification</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleSearch}>Filter</Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            {loading ? "Loading logs..." : "No logs found matching your criteria."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.timestamp), "MMM d, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.adminEmail}</span>
                                                    <span className="text-xs text-muted-foreground">{log.adminId.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getActionColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.targetType}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.targetName || "-"}</span>
                                                    <span className="text-xs text-muted-foreground">{log.targetId ? log.targetId.substring(0, 8) + '...' : ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={log.details}>
                                                {log.details}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
