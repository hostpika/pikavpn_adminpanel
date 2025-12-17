"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, MapPin, Shield, Key, Smartphone, Copy, Check, Camera, Loader2 } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import type { ActivityLog } from "@/lib/auth-service"

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  const { user, updateProfile, updatePassword, getRecentActivity } = useAuth()
  const { toast } = useToast()

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    bio: ""
  })

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  // Load User Data
  useEffect(() => {
    if (user) {
      const names = user.displayName ? user.displayName.split(' ') : ["", ""]
      setFormData({
        firstName: names[0] || "",
        lastName: names.slice(1).join(' ') || "",
        phone: user.phoneNumber || "",
        location: user.location || "",
        bio: user.bio || ""
      })
      loadActivity()
    }
  }, [user])

  const loadActivity = async () => {
    const logs = await getRecentActivity()
    setActivityLogs(logs)
  }

  const handleCopyBackupCode = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      await updateProfile({
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phone,
        location: formData.location,
        bio: formData.bio
      })
      toast({
        title: "Profile Updated",
        description: "Your account details have been successfully saved."
      })
      loadActivity() // Refresh activity log
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your new password matches the confirmation.",
        variant: "destructive"
      })
      return
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Password too weak",
        description: "Password should be at least 6 characters.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await updatePassword(passwordData.current, passwordData.new)
      toast({
        title: "Password Changed",
        description: "Your password has been updated securely."
      })
      setPasswordData({ current: "", new: "", confirm: "" })
      loadActivity()
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Password Update Failed",
        description: error.message || "Please check your current password and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const backupCodes = ["ABCD-1234-EFGH-5678", "IJKL-9012-MNOP-3456", "QRST-7890-UVWX-1234", "YZAB-5678-CDEF-9012"]

  return (

    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and security settings</p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile photo and display information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.photoURL || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback className="text-2xl">
                  {formData.firstName?.[0]}{formData.lastName?.[0] || formData.firstName?.[1]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                variant="default"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{user?.displayName || "Admin User"}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email || "admin@cloudvpn.com"}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Upload New Photo
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" defaultValue={user?.email || ""} className="pl-9" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="pl-9"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="San Francisco, CA"
                className="pl-9"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
            <Button onClick={handleProfileUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Key className="h-4 w-4" />
              Change Password
            </h4>
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
              <Button size="sm" onClick={handlePasswordUpdate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  setTwoFactorEnabled(checked)
                  if (checked) setShow2FADialog(true)
                }}
              />
            </div>

            {twoFactorEnabled && (
              <div className="pl-6 space-y-3">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  2FA Enabled
                </Badge>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your backup codes (save these securely):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg font-mono text-sm">
                        <span className="flex-1">{code}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyBackupCode}>
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent login history and account activity</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-muted-foreground text-sm text-center py-4">No recent activity found.</div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.details} • {activity.ip}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <div className="h-48 w-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-sm text-gray-500">QR Code Here</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Manual Entry Key</Label>
              <div className="flex gap-2">
                <Input readOnly value="JBSWY3DPEHPK3PXP" className="font-mono" />
                <Button size="icon" variant="outline" onClick={handleCopyBackupCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <Input placeholder="000000" maxLength={6} className="text-center text-2xl tracking-widest" />
            </div>
            <Button className="w-full" onClick={() => setShow2FADialog(false)}>
              Verify and Enable
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  )
}
