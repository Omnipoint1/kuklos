"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Smartphone, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationSettingsProps {
  userId: string
  initialPreferences: any
}

export function NotificationSettings({ userId, initialPreferences }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(
    initialPreferences || {
      email_connection_requests: true,
      email_messages: true,
      email_post_interactions: true,
      email_weekly_digest: true,
      push_connection_requests: true,
      push_messages: true,
      push_post_interactions: true,
    },
  )
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: userId,
        ...preferences,
      })

      if (error) throw error

      // Show success message or redirect
      router.refresh()
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose what email notifications you'd like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Connection Requests</h4>
              <p className="text-sm text-gray-600">When someone wants to connect with you</p>
            </div>
            <Switch
              checked={preferences.email_connection_requests}
              onCheckedChange={(checked) => handleToggle("email_connection_requests", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Messages</h4>
              <p className="text-sm text-gray-600">When you receive new messages</p>
            </div>
            <Switch
              checked={preferences.email_messages}
              onCheckedChange={(checked) => handleToggle("email_messages", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Post Interactions</h4>
              <p className="text-sm text-gray-600">When someone likes or comments on your posts</p>
            </div>
            <Switch
              checked={preferences.email_post_interactions}
              onCheckedChange={(checked) => handleToggle("email_post_interactions", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Digest</h4>
              <p className="text-sm text-gray-600">Weekly summary of your network activity</p>
            </div>
            <Switch
              checked={preferences.email_weekly_digest}
              onCheckedChange={(checked) => handleToggle("email_weekly_digest", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Manage your in-app notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Connection Requests</h4>
              <p className="text-sm text-gray-600">Real-time notifications for connection requests</p>
            </div>
            <Switch
              checked={preferences.push_connection_requests}
              onCheckedChange={(checked) => handleToggle("push_connection_requests", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Messages</h4>
              <p className="text-sm text-gray-600">Real-time notifications for new messages</p>
            </div>
            <Switch
              checked={preferences.push_messages}
              onCheckedChange={(checked) => handleToggle("push_messages", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Post Interactions</h4>
              <p className="text-sm text-gray-600">Real-time notifications for post likes and comments</p>
            </div>
            <Switch
              checked={preferences.push_post_interactions}
              onCheckedChange={(checked) => handleToggle("push_post_interactions", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
