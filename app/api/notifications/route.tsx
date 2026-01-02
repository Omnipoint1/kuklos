import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import {
  sendConnectionRequestEmail,
  sendConnectionAcceptedEmail,
  sendMessageNotificationEmail,
  sendWeeklyDigestEmail,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, type, title, message, data } = await request.json()

    // Create notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || {},
      })
      .select()
      .single()

    if (error) throw error

    // Send email notification if user has email notifications enabled
    await sendEmailNotification(userId, type, title, message, data)

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

async function sendEmailNotification(userId: string, type: string, title: string, message: string, data: any) {
  try {
    const supabase = createClient()

    // Get user preferences and email
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    const { data: userProfile } = await supabase.from("users").select("email, first_name").eq("id", userId).single()

    if (!userProfile?.email) return

    // Check if user wants email notifications for this type
    const shouldSendEmail =
      (type === "connection_request" && preferences?.email_connection_requests) ||
      (type === "message" && preferences?.email_messages) ||
      (["post_like", "post_comment"].includes(type) && preferences?.email_post_interactions) ||
      (type === "weekly_digest" && preferences?.email_weekly_digest)

    if (!shouldSendEmail) return

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    switch (type) {
      case "connection_request":
        await sendConnectionRequestEmail({
          to: userProfile.email,
          senderName: data?.senderName || "Someone",
          senderHandle: data?.senderHandle || "user",
          acceptUrl: `${baseUrl}/network?request=${data?.requestId || ""}`,
        })
        break

      case "connection_accepted":
        await sendConnectionAcceptedEmail({
          to: userProfile.email,
          senderName: data?.senderName || "Someone",
          profileUrl: `${baseUrl}/profile/${data?.senderHandle || ""}`,
        })
        break

      case "message":
        await sendMessageNotificationEmail({
          to: userProfile.email,
          senderName: data?.senderName || "Someone",
          snippet: message || "You have a new message",
          threadUrl: `${baseUrl}/messages/${data?.threadId || ""}`,
        })
        break

      case "weekly_digest":
        const digestItems = data?.items || [
          { type: "post" as const, title: "Check out this week's highlights", url: `${baseUrl}/feed` },
        ]
        await sendWeeklyDigestEmail({
          to: userProfile.email,
          firstName: userProfile.first_name,
          items: digestItems,
        })
        break

      default:
        // For other notification types, we could add more templates or skip email
        console.log(`No email template for notification type: ${type}`)
        break
    }
  } catch (error) {
    console.error("Error sending email notification:", error)
  }
}
