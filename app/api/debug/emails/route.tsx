import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email") || "test@example.com"

  try {
    const result = await resend.emails.send({
      from: "Circle Network <noreply@circle.faith>",
      to: email,
      subject: "Test Email from Circle",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Circle Network</h1>
          <p>This is a test email to verify that Resend is working properly.</p>
          <p>If you received this email, the Resend integration is functioning correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is a test email from Circle Network.
          </p>
        </div>
      `,
      tags: [
        { name: "app", value: "circle" },
        { name: "type", value: "test" },
      ],
    })

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          email,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      email,
      messageId: result.data?.id,
      message: `Test email sent successfully to ${email}`,
      resendWorking: true,
    })
  } catch (error) {
    console.error("Email debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        email,
        resendWorking: false,
      },
      { status: 500 },
    )
  }
}
