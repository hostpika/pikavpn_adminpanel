"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  Book,
  Globe,
  Cloud,
  Lock,
  Terminal,
  Mail,
  Rocket,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { usePreferences } from "@/components/preferences-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  // mobileOpen state is handled by Sheet now, or can be controlled
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find valid parent menus to expand based on current path
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    return []
  })
  const { theme, setTheme } = useTheme()
  const { sidebarDensity } = usePreferences()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user, signOut, loading } = useAuth()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully", {
        description: "You have been logged out of your account.",
      })
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
        { name: "SMTP Settings", href: "/dashboard/smtp", icon: Mail },
      ]
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
    { name: "Notifications", href: "/dashboard/notifications", icon: Send },
    { name: "Activity Logs", href: "/dashboard/logs", icon: FileText },
    {
      name: "Docs",
      href: "/dashboard/docs",
      icon: Book,
      children: [
        { name: "System Overview", href: "/dashboard/docs?section=overview", icon: Globe },
        { name: "Architecture", href: "/dashboard/docs?section=architecture", icon: Cloud },
        { name: "Auth Flows", href: "/dashboard/docs?section=auth-flow", icon: Lock },
        { name: "Deployment & Setup", href: "/dashboard/docs?section=deployment", icon: Rocket },
        { name: "Config System", href: "/dashboard/docs?section=config-system", icon: Settings },
        { name: "Ads & Pricing", href: "/dashboard/docs?section=monetization", icon: DollarSign },
        { name: "Mobile API", href: "/dashboard/docs?section=mobile-api", icon: Smartphone },
        { name: "Admin API", href: "/dashboard/docs?section=admin-api", icon: Terminal },
      ]
    },
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

  // Redirect if not admin
  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        router.push("/user-dashboard")
      }
    }
  }, [mounted, user, loading, router])

  // Prevent rendering for unauthorized users
  if (!mounted || loading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }






  // Added isCollapsed prop to decouple from parent state
  const NavLink = ({ item, isCollapsed }: { item: (typeof navigation)[0], isCollapsed: boolean }) => {
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

    if (isCollapsed && hasChildren) {
      return (
        <Link
          href={item.href}
          className={cn(
            "flex items-center justify-center rounded-xl p-2 transition-all duration-200 group relative",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => setMobileOpen(false)}
        >
          <item.icon className={cn("flex-shrink-0 w-5 h-5")} />
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
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group select-none",
            isCollapsed ? "justify-center" : "justify-between",
            isActive
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <item.icon className={cn("flex-shrink-0 w-4 h-4", isActive ? "text-primary" : "text-muted-foreground", "group-hover:text-foreground transition-colors")} />
            {!isCollapsed && <span>{item.name}</span>}
          </div>
          {!isCollapsed && hasChildren && (
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform text-muted-foreground", isExpanded ? "rotate-180" : "")} />
          )}
        </Link>


        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-9 space-y-0.5 border-l px-2 border-border/50">
            {item.children?.map(child => {
              // Exact active check using search params if present
              const isChildActive = child.href.includes('?')
                ? (pathname === child.href.split('?')[0] && searchParams.toString() === child.href.split('?')[1])
                : pathname === child.href

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg py-2 pl-3 pr-2 text-sm transition-colors relative",
                    isChildActive
                      ? "text-primary font-medium bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Active Dot */}
                  {isChildActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}

                  {child.icon && <child.icon className="w-4 h-4 opacity-70" />}
                  {child.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Refactored SidebarContent to accept isCollapsed override
  const SidebarContent = ({ isCollapsed = false, hideHeader = false }: { isCollapsed?: boolean, hideHeader?: boolean }) => (
    <>
      {!hideHeader && (
        <div className={cn("flex h-16 items-center px-4 border-b", isCollapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold gradient-text">FreeShield VPN</span>}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className={cn("space-y-1", sidebarDensity === "spacious" && "space-y-2")}>
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 py-4 text-center">
        {!isCollapsed && (
          <div className="animate-fade-in opacity-20 hover:opacity-100 transition-opacity duration-300">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Tynybite Labs
            </h2>
            <p className="text-xs font-medium text-muted-foreground mt-1">Made with Love ❤️</p>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent transition-all duration-200 hover:scale-105",
                isCollapsed && "justify-center",
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || "/placeholder.svg?height=40&width=40"} referrerPolicy="no-referrer" />
                <AvatarFallback>{user?.displayName?.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
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
        <Suspense fallback={<div />}>
          <SidebarContent isCollapsed={collapsed} />
        </Suspense>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="p-4 border-b text-left">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Freeshield VPN</span>
            </SheetTitle>
          </SheetHeader>
          <Suspense fallback={<div />}>
            <SidebarContent isCollapsed={false} hideHeader />
            {/* hideHeader is true because we manually rendered header in SheetContent for close button position if needed, 
                 actually Sheet includes standard close button. 
                 But SidebarContent has its own header logic. 
                 Let's stick to hiding SidebarContent header and using Sheet's or manual header.
                 Wait, Shadcn Sheet has a Close button automatically? Yes (X icon).
                 So we probably don't need a custom header with X inside SidebarContent.
             */}
          </Suspense>
        </SheetContent>
      </Sheet>

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
