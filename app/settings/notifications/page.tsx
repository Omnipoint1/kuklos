import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationSettings } from "@/components/settings/notification-settings"

export const dynamic = "force-dynamic"

export default async function NotificationSettingsPage() {
  try {
    const supabase = createClient()

    if (!supabase) {
      redirect("/auth/login")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get current notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">Manage how you receive notifications from Circle</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <NotificationSettings userId={user.id} initialPreferences={preferences} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // Handle build-time errors by redirecting to login
    redirect("/auth/login")
  }
}
