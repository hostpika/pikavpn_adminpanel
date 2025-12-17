"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Power, Loader2 } from "lucide-react" // Removed Filter, Grid3x3, List. Added Server, RefreshCw, Smartphone, Key are not used in the provided snippet, so keeping original for now.
import { Grid3x3, List } from "lucide-react" // Keeping Grid3x3 and List as they are used for viewMode buttons.
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
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getServers, deleteServer, updateServer, type ServerData } from "@/lib/server-service"
import { useToast } from "@/hooks/use-toast"

export default function ServersPage() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [servers, setServers] = useState<ServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await getServers()
        setServers(data)
      } catch (error) {
        console.error("Error fetching servers:", error)
        toast({
          title: "Error loading servers",
          description: "Could not fetch servers from database",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServers()
  }, [toast])

  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.country.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(server.status)
    const matchesTier = tierFilter.length === 0 || tierFilter.includes(server.tier)
    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "offline":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "maintenance":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const isServerInactive = (server: ServerData) => server.isActive === false || server.isActive === undefined && false // Default to true if undefined, but explicit check needed for older data? No, default should be true. Actually type optional? Type says boolean, but data might be missing. Using truthy check server.isActive !== false basically.


  const getLoadColor = (load: number) => {
    if (load < 50) return "bg-emerald-500"
    if (load < 80) return "bg-amber-500"
    return "bg-red-500"
  }

  const handleToggleStatus = async (server: ServerData) => {
    try {
      const newStatus = !server.isActive
      if (server.id) {
        await updateServer(server.id, { isActive: newStatus })
        setServers(servers.map((s) => (s.id === server.id ? { ...s, isActive: newStatus } : s)))
        toast({
          title: newStatus ? "Server activated" : "Server deactivated",
          description: `${server.name} is now ${newStatus ? "active" : "inactive"}`,
        })
      }
    } catch (error) {
      console.error("Error updating server status:", error)
      toast({
        title: "Error updating status",
        description: "Could not update server status",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setShowDeleteDialog(true)
  }

  const handleDeleteServer = async () => {
    if (!deleteId) return

    try {
      await deleteServer(deleteId)
      setServers(servers.filter((server) => server.id !== deleteId))
      toast({
        title: "Server deleted",
        description: `${deleteName} has been removed`,
      })
      setShowDeleteDialog(false)
      setDeleteId(null)
      setDeleteName("")
    } catch (error) {
      console.error("Error deleting server:", error)
      toast({
        title: "Error deleting server",
        description: "Could not delete the server",
        variant: "destructive",
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
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Server Management</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor your VPN servers</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search servers..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Filters
                      {(statusFilter.length > 0 || tierFilter.length > 0) && (
                        <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-xs">
                          {statusFilter.length + tierFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("online")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "online"] : statusFilter.filter((s) => s !== "online"),
                        )
                      }
                    >
                      Online
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("offline")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "offline"] : statusFilter.filter((s) => s !== "offline"),
                        )
                      }
                    >
                      Offline
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("maintenance")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "maintenance"] : statusFilter.filter((s) => s !== "maintenance"),
                        )
                      }
                    >
                      Maintenance
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Tier</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={tierFilter.includes("free")}
                      onCheckedChange={(checked) =>
                        setTierFilter(checked ? [...tierFilter, "free"] : tierFilter.filter((t) => t !== "free"))
                      }
                    >
                      Free
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={tierFilter.includes("premium")}
                      onCheckedChange={(checked) =>
                        setTierFilter(checked ? [...tierFilter, "premium"] : tierFilter.filter((t) => t !== "premium"))
                      }
                    >
                      Premium
                    </DropdownMenuCheckboxItem>
                    {(statusFilter.length > 0 || tierFilter.length > 0) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setStatusFilter([])
                            setTierFilter([])
                          }}
                        >
                          Clear Filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border p-1">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2.5"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2.5"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>

                <Link href="/dashboard/servers/add">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Server
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredServers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No servers found. Add your first server to get started.</p>
                <Link href="/dashboard/servers/add">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Server
                  </Button>
                </Link>
              </div>
            ) : viewMode === "table" ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Server</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Load</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServers.map((server) => (
                      <TableRow key={server.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xl">{server.flag}</span>
                            </div>
                            <div>
                              <div className="font-semibold">{server.name}</div>
                              <div className="text-xs text-muted-foreground">{server.protocol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{server.flag}</span>
                            <div>
                              <div className="font-medium">{server.country}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {server.ip}:{server.port}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{server.load}%</span>
                              <span className="text-muted-foreground">
                                {server.currentUsers}/{server.maxCapacity}
                              </span>
                            </div>
                            <Progress value={server.load} className={cn("h-2", getLoadColor(server.load))} />
                          </div>
                        </TableCell>
                        <TableCell>
                          {server.isActive === false ? (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                              Inactive
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={getStatusColor(server.status)}>
                              {server.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={server.tier === "premium" ? "default" : "secondary"}>{server.tier}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/dashboard/servers/edit/${server.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handleToggleStatus(server)}>
                                <Power className="h-4 w-4 mr-2" />
                                {server.isActive === false ? "Activate" : "Deactivate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDelete(server.id!, server.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServers.map((server) => (
                  <Card key={server.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{server.flag}</span>
                          <div>
                            <h3 className="font-semibold">{server.name}</h3>
                            <p className="text-xs text-muted-foreground">{server.country}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/dashboard/servers/edit/${server.id}`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => handleToggleStatus(server)}>
                              <Power className="h-4 w-4 mr-2" />
                              {server.isActive === false ? "Activate" : "Deactivate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(server.id!, server.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">IP:Port</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {server.ip}:{server.port}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Protocol</span>
                        <span className="font-medium">{server.protocol}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Load: {server.load}%</span>
                          <span className="text-muted-foreground">
                            {server.currentUsers}/{server.maxCapacity}
                          </span>
                        </div>
                        <Progress value={server.load} className={cn("h-2", getLoadColor(server.load))} />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        {server.isActive === false ? (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                            Inactive
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={getStatusColor(server.status)}>
                            {server.status}
                          </Badge>
                        )}
                        <Badge variant={server.tier === "premium" ? "default" : "secondary"}>{server.tier}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteName}</strong>? This action cannot be undone and will disconnect any active users on this server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteServer} className="bg-destructive hover:bg-destructive/90">
              Delete Server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
