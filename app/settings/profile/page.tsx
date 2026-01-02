"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
  })

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!authUser) {
          router.push("/auth/login")
          return
        }

        const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (userData) {
          setUser(userData)
          setFormData({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            headline: userData.headline || "",
            bio: userData.bio || "",
            location: userData.location || "",
            website: userData.website || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()
      setUploadedAvatarUrl(result.url)
    } catch (error) {
      console.error("Avatar upload error:", error)
      alert("Failed to upload avatar. Please try again.")
      setAvatarPreview(null)
      URL.revokeObjectURL(previewUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!user) return

    console.log("[v0] Starting profile save with data:", formData)
    console.log("[v0] User ID:", user.id)
    console.log("[v0] Uploaded avatar URL:", uploadedAvatarUrl)

    setIsSaving(true)
    try {
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        updated_at: new Date().toISOString(),
        ...(uploadedAvatarUrl && { avatar_url: uploadedAvatarUrl }),
      }

      console.log("[v0] Update data being sent:", updateData)

      const { error, data } = await supabase.from("users").update(updateData).eq("id", user.id)

      console.log("[v0] Supabase response - data:", data, "error:", error)

      if (error) {
        console.error("[v0] Supabase error details:", error)
        throw error
      }

      console.log("[v0] Profile updated successfully, redirecting...")
      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your professional information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>This information will be displayed on your public profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={avatarPreview || user?.avatar_url || "/placeholder.svg"}
                  alt={`${formData.firstName} ${formData.lastName}`}
                />
                <AvatarFallback className="text-lg">
                  {(formData.firstName?.[0] || "U").toUpperCase()}
                  {(formData.lastName?.[0] || "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Change Photo"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                {isUploading && <p className="text-sm text-blue-600 mt-1">Uploading avatar...</p>}
                {uploadedAvatarUrl && !isUploading && (
                  <p className="text-sm text-green-600 mt-1">Avatar uploaded successfully!</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g., Software Engineer at Tech Company"
              />
            </div>

            <div>
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about your professional background, interests, and goals..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploading || !formData.firstName.trim() || !formData.lastName.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
