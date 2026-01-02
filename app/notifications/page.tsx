import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { NotificationHeader } from "@/components/notifications/notification-header"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
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

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <NotificationHeader />
          <div className="bg-white rounded-lg shadow-sm border">
            <NotificationsList userId={user.id} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // Handle build-time errors by redirecting to login
    redirect("/auth/login")
  }
}
