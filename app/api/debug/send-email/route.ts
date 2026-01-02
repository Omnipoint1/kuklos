import { type NextRequest, NextResponse } from "next/server"
import {
  sendWelcomeEmail,
  sendVerifyLoginEmail,
  sendAccountConfirmedEmail,
  sendConnectionRequestEmail,
  sendConnectionAcceptedEmail,
  sendMessageNotificationEmail,
  sendWeeklyDigestEmail,
  sendCircleInviteEmail,
  sendProfileReminderEmail,
  sendEmailChangeConfirmation,
} from "@/lib/email"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available in production" }, { status: 403 })
  }

  const url = new URL(req.url)
  const to = url.searchParams.get("to")
  const type = url.searchParams.get("type") as string | null

  if (!to || !type) {
    return NextResponse.json(
      {
        ok: false,
        error: "to and type are required",
        availableTypes: [
          "verify-login",
          "welcome",
          "account-confirmed",
          "connection-request",
          "connection-accepted",
          "message-notification",
          "weekly-digest",
          "circle-invite",
          "profile-reminder",
          "email-change-confirmation",
        ],
      },
      { status: 400 },
    )
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    switch (type) {
      case "verify-login":
        await sendVerifyLoginEmail({
          to,
          url: `${baseUrl}/api/auth/callback/email?token=TEST_TOKEN`,
        })
        break

      case "welcome":
        await sendWelcomeEmail({ to, firstName: "Sarah" })
        break

      case "account-confirmed":
        await sendAccountConfirmedEmail({ to, firstName: "Sarah" })
        break

      case "connection-request":
        await sendConnectionRequestEmail({
          to,
          senderName: "Pastor John",
          senderHandle: "pastorjohn",
          acceptUrl: `${baseUrl}/network?request=123`,
        })
        break

      case "connection-accepted":
        await sendConnectionAcceptedEmail({
          to,
          senderName: "Pastor John",
          profileUrl: `${baseUrl}/profile/pastorjohn`,
        })
        break

      case "message-notification":
        await sendMessageNotificationEmail({
          to,
          senderName: "Pastor John",
          snippet: "Hey! Great to connect—would love to chat about our upcoming community outreach this week?",
          threadUrl: `${baseUrl}/messages/123`,
        })
        break

      case "weekly-digest":
        await sendWeeklyDigestEmail({
          to,
          firstName: "Sarah",
          items: [
            { type: "post", title: "Your post about community service got 12 likes", url: `${baseUrl}/post/123` },
            { type: "connection", title: "You connected with 3 new people this week", url: `${baseUrl}/network` },
            { type: "mention", title: "Pastor John mentioned you in a discussion", url: `${baseUrl}/post/456` },
          ],
        })
        break

      case "circle-invite":
        await sendCircleInviteEmail({
          to,
          inviterName: "Pastor John",
          circleName: "Youth Ministry Leaders",
          joinUrl: `${baseUrl}/circles/youth-ministry/join?token=abc123`,
        })
        break

      case "profile-reminder":
        await sendProfileReminderEmail({
          to,
          firstName: "Sarah",
          percent: 65,
          profileUrl: `${baseUrl}/settings/profile`,
        })
        break

      case "email-change-confirmation":
        await sendEmailChangeConfirmation({
          to,
          confirmUrl: `${baseUrl}/settings/email/confirm?token=xyz789`,
        })
        break

      default:
        return NextResponse.json({ ok: false, error: "Unknown email type" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: `${type} email sent to ${to}` })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    )
  }
}
