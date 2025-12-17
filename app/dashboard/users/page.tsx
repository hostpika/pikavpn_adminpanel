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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  Mail,
  Download,
  Ban,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUsers, updateUser, deleteUser, type UserData } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function UsersPage() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [actionType, setActionType] = useState<"suspend" | "grant" | "delete" | null>(null)
  const [actionForm, setActionForm] = useState({ duration: "30", reason: "" })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(user.status)
    const matchesTier = tierFilter.length === 0 || tierFilter.includes(user.tier)
    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "trial":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "premium":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "suspended":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-3 w-3" />
      case "trial":
        return <Clock className="h-3 w-3" />
      case "premium":
        return <Crown className="h-3 w-3" />
      case "suspended":
        return <Ban className="h-3 w-3" />
      default:
        return null
    }
  }

  const openDetailDialog = (user: UserData) => {
    setSelectedUser(user)
    setShowDetailDialog(true)
  }

  const openActionDialog = (user: UserData, action: "suspend" | "grant" | "delete") => {
    setSelectedUser(user)
    setActionType(action)
    setShowActionDialog(true)
  }

  const handleAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      if (actionType === "suspend") {
        await updateUser(selectedUser.id!, { status: "suspended" })
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, status: "suspended" as const } : u)))
        toast({
          title: "Success",
          description: "User account has been suspended.",
        })
      } else if (actionType === "grant") {
        await updateUser(selectedUser.id!, { status: "premium", tier: "premium" })
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id ? { ...u, status: "premium" as const, tier: "premium" as const } : u,
          ),
        )
        toast({
          title: "Success",
          description: "Premium access has been granted.",
        })
      } else if (actionType === "delete") {
        await deleteUser(selectedUser.id!)
        setUsers(users.filter((u) => u.id !== selectedUser.id))
        toast({
          title: "Success",
          description: "User account has been deleted.",
        })
      }

      setShowActionDialog(false)
      setActionForm({ duration: "30", reason: "" })
    } catch (error) {
      console.error("[v0] Error performing action:", error)
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    premium: users.filter((u) => u.status === "premium").length,
    trial: users.filter((u) => u.status === "trial").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts and subscriptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-2xl font-bold">{stats.premium}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trial</p>
                  <p className="text-2xl font-bold">{stats.trial}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">{stats.suspended}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Ban className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
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
                      checked={statusFilter.includes("active")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "active"] : statusFilter.filter((s) => s !== "active"),
                        )
                      }
                    >
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("trial")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "trial"] : statusFilter.filter((s) => s !== "trial"),
                        )
                      }
                    >
                      Trial
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("premium")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "premium"] : statusFilter.filter((s) => s !== "premium"),
                        )
                      }
                    >
                      Premium
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("suspended")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "suspended"] : statusFilter.filter((s) => s !== "suspended"),
                        )
                      }
                    >
                      Suspended
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
                      checked={tierFilter.includes("basic")}
                      onCheckedChange={(checked) =>
                        setTierFilter(checked ? [...tierFilter, "basic"] : tierFilter.filter((t) => t !== "basic"))
                      }
                    >
                      Basic
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
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter.length > 0 || tierFilter.length > 0
                    ? "Try adjusting your filters"
                    : "Users will appear here once they register"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={user.uid || user.id || index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {(user.name || "User")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", getStatusColor(user.status))}>
                            {getStatusIcon(user.status)}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.tier === "premium" ? (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Premium</Badge>
                          ) : user.tier === "basic" ? (
                            <Badge variant="secondary">Basic</Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.registrationDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.lastLogin}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{user.totalConnectionTime}</div>
                            <div className="text-muted-foreground">{user.dataTransferred}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              {/* Admin Actions Only */}
                              {/* @ts-ignore - Check for role existence */}
                              {currentUser?.role === "admin" && (
                                <>
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openActionDialog(user, "grant")}>
                                    <Crown className="mr-2 h-4 w-4" />
                                    Grant Premium
                                  </DropdownMenuItem>
                                  {user.status !== "suspended" && (
                                    <DropdownMenuItem onClick={() => openActionDialog(user, "suspend")}>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Suspend Account
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => openActionDialog(user, "delete")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Account
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Comprehensive user account information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xl">
                      {(selectedUser.name || "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Subscription Tier</Label>
                    <div className="font-semibold capitalize">{selectedUser.tier}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Registered</Label>
                    <div className="font-semibold">{selectedUser.registrationDate}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Login</Label>
                    <div className="font-semibold">{selectedUser.lastLogin}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Device Count</Label>
                    <div className="font-semibold">{selectedUser.deviceCount} devices</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Total Connection Time</p>
                        <p className="text-3xl font-bold">{selectedUser.totalConnectionTime}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Data Transferred</p>
                        <p className="text-3xl font-bold">{selectedUser.dataTransferred}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <p className="text-sm text-muted-foreground">Connection history and activity logs would appear here.</p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend" && "Suspend User Account"}
              {actionType === "grant" && "Grant Premium Access"}
              {actionType === "delete" && "Delete User Account"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "suspend" &&
                "This will prevent the user from accessing their account. You can unsuspend them later."}
              {actionType === "grant" && "Grant this user complimentary premium access for a specified duration."}
              {actionType === "delete" && "This action is irreversible and will permanently delete all user data."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === "grant" && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={actionForm.duration}
                  onChange={(e) => setActionForm({ ...actionForm, duration: e.target.value })}
                />
              </div>
            )}

            {(actionType === "suspend" || actionType === "grant") && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason / Notes</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for this action..."
                  value={actionForm.reason}
                  onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                />
              </div>
            )}

            {actionType === "delete" && selectedUser && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-semibold mb-2">Warning: This cannot be undone</p>
                <p className="text-sm text-muted-foreground">
                  Please type <code className="bg-background px-1 py-0.5 rounded">{selectedUser.email}</code> to confirm
                  deletion.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button variant={actionType === "delete" ? "destructive" : "default"} onClick={handleAction}>
              {actionType === "suspend" && "Suspend Account"}
              {actionType === "grant" && "Grant Premium"}
              {actionType === "delete" && "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
