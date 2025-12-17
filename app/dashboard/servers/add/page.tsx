"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { CountrySelector } from "@/components/country-selector"
import { parseOVPNFile } from "@/lib/ovpn-parser"
import { addServer, uploadOVPNFile, getCountryFlag, updateServer, deleteServer } from "@/lib/server-service"
import { useToast } from "@/hooks/use-toast"

export default function AddServerPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.push("/dashboard/servers")
      toast({
        title: "Access Denied",
        description: "You do not have permission to add servers.",
        variant: "destructive",
      })
    }
  }, [user, authLoading, router, toast])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  const [ovpnFile, setOvpnFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    ip: "",
    port: "1194",
    protocol: "UDP",
    tier: "free",
    maxCapacity: "500",
    streaming: false,
    p2p: false,
    notes: "",
    isActive: true,
    username: "vpn",
    password: "vpn",
  })

  const handleOVPNUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".ovpn")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .ovpn file",
        variant: "destructive",
      })
      return
    }

    setOvpnFile(file)

    // Read and parse the file
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = parseOVPNFile(content)

      if (result.isValid && result.config) {
        setFormData((prev) => ({
          ...prev,
          ip: result.config!.ip,
          port: result.config!.port,
          protocol: result.config!.protocol,
        }))
        toast({
          title: "File parsed successfully",
          description: "Server details extracted from OVPN file",
        })
      } else {
        const errorMsg = result.errors.join(", ")
        toast({
          title: "Invalid OVPN File",
          description: errorMsg || "Could not extract server details from OVPN file",
          variant: "destructive",
        })
        // Optionally clear the invalid file
        setOvpnFile(null)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let createdServerId: string | null = null

    try {
      // 1. Create Server Document
      const serverId = await addServer({
        name: formData.name,
        country: formData.country,
        flag: getCountryFlag(formData.country),
        ip: formData.ip,
        port: Number(formData.port),
        protocol: formData.protocol,
        tier: formData.tier as "free" | "premium",
        maxCapacity: Number(formData.maxCapacity),
        streaming: formData.streaming,
        p2p: formData.p2p,
        notes: formData.notes,
        status: "online",
        load: 0,
        currentUsers: 0,
        isActive: formData.isActive,
        username: formData.username,
        password: formData.password,
      })

      createdServerId = serverId
      console.log("Server created with ID:", serverId)

      // 2. Upload OVPN File (if exists) and Update Server
      if (ovpnFile) {
        try {
          const downloadURL = await uploadOVPNFile(ovpnFile, serverId)
          console.log("OVPN uploaded, URL:", downloadURL)

          await updateServer(serverId, {
            ovpnFileUrl: downloadURL
          })
          console.log("Server updated with OVPN URL")

        } catch (uploadError) {
          console.error("Failed to upload OVPN:", uploadError)
          throw new Error("Failed to upload OVPN file. Server creation rolled back.")
        }
      }

      toast({
        title: "Server added successfully",
        description: `${formData.name} has been added to your server list`,
      })

      router.push("/dashboard/servers")
    } catch (error: any) {
      console.error("Error adding server:", error)

      // Rollback: Delete the created server doc if anything failed
      if (createdServerId) {
        try {
          await deleteServer(createdServerId)
          console.log("Rolled back: Deleted server", createdServerId)
        } catch (cleanupError) {
          console.error("Failed to rollback server deletion:", cleanupError)
        }
      }

      toast({
        title: "Error adding server",
        description: error.message || "Please check your Firebase configuration and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servers">
          <Button variant="ghost" size="icon" className="hover:scale-110 active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Server</h1>
          <p className="text-muted-foreground mt-2">Configure a new VPN server</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Server Information</span>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </CardTitle>
            <CardDescription>Enter the details for your new VPN server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ovpn">OVPN Configuration File</Label>
              <div className="flex items-center gap-3">
                <Input id="ovpn" type="file" accept=".ovpn" onChange={handleOVPNUpload} className="cursor-pointer" />
                {ovpnFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {ovpnFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an OVPN file to automatically extract IP, port, and protocol
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name *</Label>
                <Input
                  id="name"
                  placeholder="US-East-01"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <CountrySelector
                  value={formData.country}
                  onChange={(value) => setFormData({ ...formData, country: value })}
                  placeholder="Select country..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address *</Label>
                <Input
                  id="ip"
                  placeholder="198.51.100.1"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port *</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="1194"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protocol">Protocol *</Label>
                <Select
                  value={formData.protocol}
                  onValueChange={(value) => setFormData({ ...formData, protocol: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Tier *</Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Max Capacity *</Label>
              <Input
                id="maxCapacity"
                type="number"
                placeholder="500"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Features</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="streaming"
                    checked={formData.streaming}
                    onCheckedChange={(checked) => setFormData({ ...formData, streaming: checked as boolean })}
                  />
                  <label htmlFor="streaming" className="text-sm cursor-pointer">
                    Streaming Optimized
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="p2p"
                    checked={formData.p2p}
                    onCheckedChange={(checked) => setFormData({ ...formData, p2p: checked as boolean })}
                  />
                  <label htmlFor="p2p" className="text-sm cursor-pointer">
                    P2P / Torrenting
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for internal reference..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Link href="/dashboard/servers">
                <Button variant="outline" type="button" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding Server...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Add Server
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>

  )
}
