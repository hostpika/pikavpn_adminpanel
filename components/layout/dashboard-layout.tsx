"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Server,
  Users,
  Settings,
  BarChart3,
  Activity,
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  User,
  Moon,
  Sun,
  Smartphone,
  Flag as Flask,
  ChevronDown,
  Zap,
  Palette,
  DollarSign,
  Send,
  FileText, // Added FileText icon
  PlusCircle,
  Computer,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { usePreferences } from "@/components/preferences-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find valid parent menus to expand based on current path
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // This initial state might not work if 'navigation' isn't defined yet,
    // but we can move navigation definition up or rely on the effect below.
    return []
  })
  const { theme, setTheme } = useTheme()
  const { sidebarDensity } = usePreferences()
  const pathname = usePathname()
  const router = useRouter()

  const { user, signOut } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully", {
        description: "You have been logged out of your account.",
      })
      // router.push("/login") // Handled by AuthProvider now
    } catch (error) {
      toast.error("Sign out failed", {
        description: "There was an error signing you out. Please try again.",
      })
    }
  }

  const densityClasses = {
    compact: { py: "py-1.5", gap: "gap-2", textSize: "text-xs", iconSize: "h-4 w-4" },
    comfortable: { py: "py-2.5", gap: "gap-3", textSize: "text-sm", iconSize: "h-5 w-5" },
    spacious: { py: "py-3.5", gap: "gap-4", textSize: "text-base", iconSize: "h-6 w-6" },
  }
  const density = densityClasses[sidebarDensity]

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Servers",
      href: "/dashboard/servers",
      icon: Server,
      children: [
        { name: "All Servers", href: "/dashboard/servers", icon: Computer },
        { name: "Add New Server", href: "/dashboard/servers/add", icon: PlusCircle },
      ]
    },
    { name: "Users", href: "/dashboard/users", icon: Users },
    {
      name: "Configuration",
      href: "/dashboard/config",
      icon: Settings,
      children: [
        { name: "App Config", href: "/dashboard/config/app", icon: Zap },
        { name: "Advertising", href: "/dashboard/config/ads", icon: DollarSign },
        { name: "UI & Branding", href: "/dashboard/config/ui", icon: Palette },
        { name: "VPN Settings", href: "/dashboard/config/vpn", icon: Shield },
        { name: "Subscriptions", href: "/dashboard/config/subscriptions", icon: Settings },
      ]
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
    { name: "Notifications", href: "/dashboard/notifications", icon: Send },
    { name: "Activity Logs", href: "/dashboard/logs", icon: FileText },
    { name: "More Apps", href: "/dashboard/more-apps", icon: Smartphone },
  ]

  // Effect to auto-expand menu if a child is active
  useEffect(() => {
    navigation.forEach(item => {
      if (item.children && item.children.some(child => pathname === child.href)) {
        setExpandedMenus(prev => {
          if (!prev.includes(item.name)) return [...prev, item.name]
          return prev
        })
      }
    })
  }, [pathname])

  const NavLink = ({ item }: { item: (typeof navigation)[0] }) => {
    const isActive = pathname === item.href || (item.children && item.children.some(c => pathname === c.href))
    const isExpanded = expandedMenus.includes(item.name)
    const hasChildren = item.children && item.children.length > 0

    const toggleMenu = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault()
        setExpandedMenus(prev =>
          prev.includes(item.name)
            ? prev.filter(n => n !== item.name)
            : [...prev, item.name]
        )
      }
    }

    if (collapsed && hasChildren) {
      // In collapsed mode, we can show a tooltip or just link to the main href (which redirects)
      return (
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-xl px-3 font-medium transition-all duration-200 hover:scale-105 active:scale-95 group relative overflow-hidden",
            density.py,
            density.gap,
            density.textSize,
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground",
          )}
          onClick={() => setMobileOpen(false)}
        >
          <item.icon className={cn("flex-shrink-0", density.iconSize, "mx-auto")} />
          {isActive && collapsed && <div className="absolute inset-y-0 left-0 w-1 bg-primary/20" />}
        </Link>
      )
    }

    return (
      <div className="space-y-1">
        <Link
          href={hasChildren ? "#" : item.href}
          onClick={(e) => {
            if (hasChildren) toggleMenu(e)
            else setMobileOpen(false)
          }}
          className={cn(
            "flex items-center rounded-xl px-3 font-medium transition-all duration-200 group relative",
            collapsed ? "justify-center" : "justify-between",
            density.py,
            density.gap,
            density.textSize,
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground",
          )}
        >
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            {/* Icon with subtle background for active state if needed, or just clean */}
            <item.icon className={cn("flex-shrink-0 transition-transform duration-200 group-hover:scale-110", density.iconSize)} />
            {!collapsed && <span>{item.name}</span>}
          </div>
          {!collapsed && hasChildren && (
            <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto text-muted-foreground/70", isExpanded ? "rotate-180" : "")} />
          )}
        </Link>


        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 pl-3 space-y-1 animate-slide-down relative">
            {/* Decoration line for hierarchy (optional, cleaner without) */}
            <div className="absolute left-0 top-1 bottom-1 w-px bg-border/40" />
            {item.children?.map(child => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-lg py-2 pl-3 pr-2 text-sm transition-colors relative",
                  pathname === child.href
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50"
                )}
              >
                {/* Small indicator for active */}
                {pathname === child.href && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />}
                {child.icon ? <child.icon className="h-4 w-4 mr-2 opacity-70" /> : <div className="w-1" />}
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const SidebarContent = ({ hideHeader = false }: { hideHeader?: boolean }) => (
    <>
      {!hideHeader && (
        <div className={cn("flex h-16 items-center px-4 border-b", collapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!collapsed && <span className="text-xl font-bold gradient-text">SuperVPN</span>}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className={cn("space-y-1", sidebarDensity === "spacious" && "space-y-2")}>
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent transition-all duration-200 hover:scale-105",
                collapsed && "justify-center",
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>{user?.displayName?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-sm font-semibold truncate">{user?.displayName || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/preferences" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-card transition-all duration-300 relative",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <Button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-20 h-6 w-6 rounded-full border shadow-md p-0 bg-background hover:bg-accent text-muted-foreground hover:text-foreground hidden lg:flex items-center justify-center"
          variant="ghost"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">CloudVPN</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent hideHeader />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-card px-4 lg:px-6 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden hover:scale-110 active:scale-95 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search servers, users..." className="pl-9" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative hover:scale-110 active:scale-95 transition-all"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5 rotate-0 transition-transform duration-500" />
                ) : (
                  <Moon className="h-5 w-5 rotate-180 transition-transform duration-500" />
                )
              ) : (
                <Sun className="h-5 w-5 rotate-0 opacity-0" /> // Placeholder to prevent layout shift
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:scale-110 active:scale-95 transition-all">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 animate-scale-in">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-2 p-2">
                  {[
                    { title: "Server offline", description: "EU-West-01 went offline", time: "5 min ago" },
                    { title: "New user signup", description: "Premium user registered", time: "12 min ago" },
                    { title: "High server load", description: "US-East-02 at 95% capacity", time: "1 hour ago" },
                  ].map((notification, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg hover:bg-accent cursor-pointer transition-all hover:scale-105"
                    >
                      <div className="font-semibold text-sm">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
