"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Search, Filter, RefreshCw, FileText, ChevronLeft, ChevronRight } from "lucide-react"

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
import { toast } from "sonner"
import { AdminAlert } from "@/components/admin-alert"
import { Skeleton } from "@/components/ui/skeleton"

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

    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState("all")
    const [adminFilter, setAdminFilter] = useState("")
    const [date, setDate] = useState<Date | undefined>(undefined)

    // Client-side Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        loadLogs()
    }, [actionFilter, date]) // adminFilter triggers via handleSearch

    const loadLogs = async () => {
        try {
            setLoading(true)
            // Fetch a large batch for client-side pagination (matching Users page behavior)
            let query = `/api/admin/logs?limit=1000`

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
            setCurrentPage(1) // Reset to first page on new fetch
        } catch (error) {
            console.error("Error loading logs:", error)
            toast.error("Error", {
                description: "Failed to load activity logs",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        loadLogs()
    }

    // Client-side Pagination Logic
    const totalPages = Math.ceil(logs.length / itemsPerPage)
    const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
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

            <Card className="rounded-[2rem] border-0 shadow-sm bg-card/50 backdrop-blur-xl dark:border dark:border-white/10 dark:bg-white/5">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>Recent actions performed by administrators.</CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" onClick={() => loadLogs()} title="Refresh Logs" className="rounded-full h-8 w-8 p-0">
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
                                    className="pl-8 rounded-xl border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                                    value={adminFilter}
                                    onChange={(e) => setAdminFilter(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] rounded-xl border-dashed">
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
                                        "w-[240px] justify-start text-left font-normal rounded-xl border-dashed",
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
                        <Button onClick={handleSearch} className="rounded-xl shadow-sm">Filter</Button>
                    </div>

                    <div className="rounded-2xl border overflow-hidden bg-background/50">
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
                                {loading ? (
                                    [...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 px-2 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.timestamp), "MMM d, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.adminEmail}</span>
                                                    <span className="text-xs text-muted-foreground">{log.adminId ? log.adminId.substring(0, 8) + '...' : ''}</span>
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
                                                    <span className="font-medium">
                                                        {(typeof log.targetName === 'string' ? log.targetName : (log.targetName as any)?.name) || "-"}
                                                    </span>
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

                    {/* Pagination Controls */}
                    {logs.length > 0 && (
                        <div className="flex items-center justify-between py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="rounded-xl h-8 px-3"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium mx-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="rounded-xl h-8 px-3"
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
