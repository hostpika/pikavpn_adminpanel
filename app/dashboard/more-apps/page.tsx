"use client"

import { useState } from "react"

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
import { useAuth } from "@/components/auth-provider"
import { AdminAlert } from "@/components/admin-alert"

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
    name: "SuperVPN Pro",
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
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

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteApp = () => {
    if (!deleteId) return
    setApps(apps.filter((app) => app.id !== deleteId))
    setShowDeleteDialog(false)
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
          placeholder="SuperVPN Pro"
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
    <>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">More Apps</h1>
            <p className="text-muted-foreground mt-2">Manage your published apps on Google Play Store</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2" disabled={!isAdmin}>
            <Plus className="h-4 w-4" />
            Add App
          </Button>
        </div>

        <AdminAlert />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New App Card */}
          <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:border-primary transition-colors min-h-[220px]" onClick={() => isAdmin && setShowAddDialog(true)}>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Add New App</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">Add another application to your portfolio</p>
          </Card>
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
                    onClick={() => openEditDialog(app)}
                    disabled={!isAdmin}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => confirmDelete(app.id)}
                    disabled={!isAdmin}
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


      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the app from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApp} className="bg-destructive hover:bg-destructive/90">
              Delete App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
