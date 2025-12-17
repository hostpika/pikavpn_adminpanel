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

    // Pagination state
    const [cursors, setCursors] = useState<(string | null)[]>([null])
    const [currentPage, setCurrentPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const LIMIT = 20

    const loadLogs = async (cursor: string | null = null) => {
        try {
            setLoading(true)
            let query = `/api/logs?limit=${LIMIT}`

            if (cursor) {
                query += `&lastTimestamp=${cursor}`
            }

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
            setHasNextPage(data.hasMore)

            // If there's a next page, ensure we have the cursor for it stored
            if (data.hasMore && data.nextCursor) {
                setCursors(prev => {
                    const newCursors = [...prev]
                    // We are currently on 'currentPage'. The cursor to fetch THIS page was cursors[currentPage].
                    // The cursor to fetch the NEXT page (currentPage + 1) is data.nextCursor.
                    newCursors[currentPage + 1] = data.nextCursor
                    return newCursors
                })
            }
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

    const handleNext = () => {
        if (hasNextPage) {
            const nextPage = currentPage + 1
            setCurrentPage(nextPage)
            loadLogs(cursors[nextPage])
        }
    }

    const handlePrevious = () => {
        if (currentPage > 0) {
            const prevPage = currentPage - 1
            setCurrentPage(prevPage)
            loadLogs(cursors[prevPage])
        }
    }

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(0)
        setCursors([null])
        loadLogs(null)
    }, [actionFilter, date]) // adminFilter triggers via handleSearch

    const handleSearch = () => {
        setCurrentPage(0)
        setCursors([null])
        loadLogs(null)
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
                            <Button variant="outline" size="sm" onClick={() => loadLogs(cursors[currentPage])} title="Refresh Logs" className="rounded-full h-8 w-8 p-0">
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
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentPage === 0 || loading}
                                className="rounded-xl h-8 px-3"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={!hasNextPage || loading}
                                className="rounded-xl h-8 px-3"
                            >
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
