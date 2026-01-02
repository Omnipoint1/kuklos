import type React from "react"
import { Resend } from "resend"
import WelcomeEmail from "@/emails/WelcomeEmail"
import AccountConfirmedEmail from "@/emails/AccountConfirmedEmail"
import ConnectionRequestEmail from "@/emails/ConnectionRequestEmail"
import ConnectionAcceptedEmail from "@/emails/ConnectionAcceptedEmail"
import MessageNotificationEmail from "@/emails/MessageNotificationEmail"
import WeeklyDigestEmail from "@/emails/WeeklyDigestEmail"
import CircleInviteEmail from "@/emails/CircleInviteEmail"
import ProfileReminderEmail from "@/emails/ProfileReminderEmail"
import EmailChangeConfirmationEmail from "@/emails/EmailChangeConfirmationEmail"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "Circle Network <noreply@omnipointtechnology.com>"
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

async function sendMail({
  to,
  subject,
  react,
  type,
}: {
  to: string
  subject: string
  react: React.ReactElement
  type: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    react,
    tags: [
      { name: "app", value: "circle" },
      { name: "type", value: type },
    ],
  })
  if (error) throw error
}

export async function sendVerifyLoginEmail({ to, url }: { to: string; url: string }) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Your Circle sign‑in link",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="background-color: #f6f9fc; font-family: Inter, Arial, sans-serif; margin: 0; padding: 24px;">
          <div style="background-color: #ffffff; margin: 24px auto; padding: 24px; border-radius: 12px; max-width: 560px;">
            <h1 style="font-size: 24px; margin: 0; color: #7c3aed;">Circle</h1>
            <p style="color: #475467; margin-top: 8px; font-size: 16px;">Sign in to Circle</p>
            
            <div style="margin-top: 16px;">
              <p style="font-size: 16px; line-height: 24px; margin: 16px 0;">
                Click the button below to finish signing in. This link expires in 60 minutes.
              </p>
              
              <a href="${url}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 500;">
                Sign in to Circle
              </a>
              
              <p style="color: #667085; font-size: 14px; margin-top: 16px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
            
            <hr style="margin-top: 24px; margin-bottom: 12px; border-color: #EAECF0; border-width: 1px 0 0 0;" />
            <p style="color: #98A2B3; font-size: 12px; line-height: 16px;">
              You're receiving this transactional email because you have a Circle account. Need help? Reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    tags: [
      { name: "app", value: "circle" },
      { name: "type", value: "verify-login" },
    ],
  })

  if (error) throw error
}

export async function sendWelcomeEmail({ to, firstName }: { to: string; firstName?: string }) {
  await sendMail({
    to,
    subject: `Welcome to Circle${firstName ? ", " + firstName : ""}`,
    react: WelcomeEmail({ firstName }),
    type: "welcome",
  })
}

export async function sendAccountConfirmedEmail({ to, firstName }: { to: string; firstName?: string }) {
  await sendMail({
    to,
    subject: "Your Circle account is ready",
    react: AccountConfirmedEmail({ firstName }),
    type: "account-confirmed",
  })
}

export async function sendConnectionRequestEmail({
  to,
  senderName,
  senderHandle,
  acceptUrl,
}: {
  to: string
  senderName: string
  senderHandle: string
  acceptUrl: string
}) {
  await sendMail({
    to,
    subject: `${senderName} wants to connect on Circle`,
    react: ConnectionRequestEmail({ senderName, senderHandle, acceptUrl }),
    type: "connection-request",
  })
}

export async function sendConnectionAcceptedEmail({
  to,
  senderName,
  profileUrl,
}: {
  to: string
  senderName: string
  profileUrl: string
}) {
  await sendMail({
    to,
    subject: `You're now connected with ${senderName}`,
    react: ConnectionAcceptedEmail({ senderName, profileUrl }),
    type: "connection-accepted",
  })
}

export async function sendMessageNotificationEmail({
  to,
  senderName,
  snippet,
  threadUrl,
}: {
  to: string
  senderName: string
  snippet: string
  threadUrl: string
}) {
  await sendMail({
    to,
    subject: `New message from ${senderName}`,
    react: MessageNotificationEmail({ senderName, snippet, threadUrl }),
    type: "message-notification",
  })
}

export async function sendWeeklyDigestEmail({
  to,
  firstName,
  items,
}: {
  to: string
  firstName?: string
  items: { type: "post" | "connection" | "mention"; title: string; url: string }[]
}) {
  await sendMail({
    to,
    subject: "This week on Circle",
    react: WeeklyDigestEmail({ firstName, items }),
    type: "weekly-digest",
  })
}

export async function sendCircleInviteEmail({
  to,
  inviterName,
  circleName,
  joinUrl,
}: {
  to: string
  inviterName: string
  circleName: string
  joinUrl: string
}) {
  await sendMail({
    to,
    subject: `You're invited to join ${circleName} on Circle`,
    react: CircleInviteEmail({ inviterName, circleName, joinUrl }),
    type: "circle-invite",
  })
}

export async function sendProfileReminderEmail({
  to,
  firstName,
  percent,
  profileUrl,
}: {
  to: string
  firstName?: string
  percent: number
  profileUrl: string
}) {
  await sendMail({
    to,
    subject: `Finish your Circle profile (you're ${percent}% there)`,
    react: ProfileReminderEmail({ firstName, percent, profileUrl }),
    type: "profile-reminder",
  })
}

export async function sendEmailChangeConfirmation({
  to,
  confirmUrl,
}: {
  to: string
  confirmUrl: string
}) {
  await sendMail({
    to,
    subject: "Confirm your new email for Circle",
    react: EmailChangeConfirmationEmail({ confirmUrl }),
    type: "email-change-confirmation",
  })
}
