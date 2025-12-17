"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, ExternalLink, Edit, Trash2, Smartphone } from "lucide-react"
import Image from "next/image"

type AppType = {
  id: string
  name: string
  description: string
  playstoreUrl: string
  imageUrl: string
  category: string
  downloads: string
  rating: string
}

const mockApps: AppType[] = [
  {
    id: "1",
    name: "CloudVPN Pro",
    description: "Premium VPN service with unlimited bandwidth and 50+ server locations",
    playstoreUrl: "https://play.google.com/store/apps/details?id=com.cloudvpn.pro",
    imageUrl: "/cloudvpn-icon.jpg",
    category: "Tools",
    downloads: "100K+",
    rating: "4.5",
  },
  {
    id: "2",
    name: "CloudVPN Lite",
    description: "Fast and secure free VPN for everyday browsing",
    playstoreUrl: "https://play.google.com/store/apps/details?id=com.cloudvpn.lite",
    imageUrl: "/cloudvpn-lite-icon.jpg",
    category: "Tools",
    downloads: "500K+",
    rating: "4.3",
  },
]

export default function MoreAppsPage() {
  const [apps, setApps] = useState<AppType[]>(mockApps)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    playstoreUrl: "",
    imageUrl: "",
    category: "",
    downloads: "",
    rating: "",
  })

  const handleAddApp = () => {
    const newApp: AppType = {
      id: String(apps.length + 1),
      ...formData,
    }
    setApps([...apps, newApp])
    setShowAddDialog(false)
    resetForm()
  }

  const handleEditApp = () => {
    if (!selectedApp) return
    const updatedApps = apps.map((app) => (app.id === selectedApp.id ? { ...app, ...formData } : app))
    setApps(updatedApps)
    setShowEditDialog(false)
    setSelectedApp(null)
    resetForm()
  }

  const handleDeleteApp = (id: string) => {
    if (confirm("Are you sure you want to delete this app?")) {
      setApps(apps.filter((app) => app.id !== id))
    }
  }

  const openEditDialog = (app: AppType) => {
    setSelectedApp(app)
    setFormData({
      name: app.name,
      description: app.description,
      playstoreUrl: app.playstoreUrl,
      imageUrl: app.imageUrl,
      category: app.category,
      downloads: app.downloads,
      rating: app.rating,
    })
    setShowEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      playstoreUrl: "",
      imageUrl: "",
      category: "",
      downloads: "",
      rating: "",
    })
  }

  const AppFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">App Name *</Label>
        <Input
          id="name"
          placeholder="CloudVPN Pro"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the app..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="playstoreUrl">Play Store URL *</Label>
        <Input
          id="playstoreUrl"
          placeholder="https://play.google.com/store/apps/details?id=..."
          value={formData.playstoreUrl}
          onChange={(e) => setFormData({ ...formData, playstoreUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">App Icon URL *</Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/app-icon.png"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="Tools"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="downloads">Downloads</Label>
          <Input
            id="downloads"
            placeholder="100K+"
            value={formData.downloads}
            onChange={(e) => setFormData({ ...formData, downloads: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            placeholder="4.5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">More Apps</h1>
            <p className="text-muted-foreground mt-2">Manage your published apps on Google Play Store</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add App
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="overflow-hidden hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={app.imageUrl || "/placeholder.svg"}
                      alt={app.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{app.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {app.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">⭐ {app.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {app.downloads} downloads
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent" asChild>
                    <a href={app.playstoreUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      View on Play Store
                    </a>
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => openEditDialog(app)}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDeleteApp(app.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New App</DialogTitle>
            <DialogDescription>Add a new app to your Play Store portfolio</DialogDescription>
          </DialogHeader>
          <AppFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApp}>Add App</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit App</DialogTitle>
            <DialogDescription>Update app information</DialogDescription>
          </DialogHeader>
          <AppFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditApp}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
