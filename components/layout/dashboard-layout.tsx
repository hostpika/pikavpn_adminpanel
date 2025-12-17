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
  Send, // Added Send icon
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { usePreferences } from "@/components/preferences-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const { user, signOut } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
      // router.push("/login") // Handled by AuthProvider now
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
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
    { name: "Servers", href: "/dashboard/servers", icon: Server },
    { name: "Users", href: "/dashboard/users", icon: Users },
    {
      name: "Configuration",
      href: "/dashboard/config",
      icon: Settings,
      children: [
        { name: "Features", href: "/dashboard/config/features", icon: Zap },
        { name: "VPN Settings", href: "/dashboard/config/vpn", icon: Shield },
        { name: "UI & Branding", href: "/dashboard/config/ui", icon: Palette },
        { name: "Advertising", href: "/dashboard/config/ads", icon: DollarSign },
        { name: "Subscriptions", href: "/dashboard/config/subscriptions", icon: Settings },
      ]
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
    { name: "Notifications", href: "/dashboard/notifications", icon: Send },
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
      // For better UX, we could use a Dropdown, but for now we'll stick to the simpler link behavior
      // which will redirect to the first sub-page.
      return (
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-lg px-3 font-medium transition-all duration-200 hover:scale-105 active:scale-95",
            density.py,
            density.gap,
            density.textSize,
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => setMobileOpen(false)}
        >
          <item.icon className={cn("flex-shrink-0", density.iconSize, "mx-auto")} />
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
            "flex items-center rounded-lg px-3 font-medium transition-all duration-200",
            collapsed ? "justify-center" : "justify-between",
            density.py,
            density.gap,
            density.textSize,
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <item.icon className={cn("flex-shrink-0", density.iconSize)} />
            {!collapsed && <span>{item.name}</span>}
          </div>
          {!collapsed && hasChildren && (
            <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", isExpanded ? "rotate-180" : "")} />
          )}
        </Link>


        {hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l space-y-1 animate-slide-down">
            {item.children?.map(child => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-md py-2 px-3 text-sm transition-colors",
                  pathname === child.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {child.icon && <child.icon className="h-4 w-4 mr-2" />}
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
          {!collapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SuperVPN</span>
            </div>
          )}
          {collapsed && (
            <div
              className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center cursor-pointer animate-scale-in hover:scale-105 transition-transform"
              onClick={() => setCollapsed(false)}
            >
              <Shield className="h-6 w-6 text-white" />
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex h-8 w-8 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
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
