import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    })

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("[v0] Error checking existing users:", listError)
      return NextResponse.json({ success: false, error: "Failed to verify account availability" }, { status: 500 })
    }

    const existingUser = usersData.users.find((user) => user.email === email)

    if (existingUser) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 })
    }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      timestamp: Date.now(),
    }

    const token = Buffer.from(JSON.stringify(userData)).toString("base64")

    const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.kuklos.app"

    const verificationUrl = `${baseUrl}/api/auth/confirm?token=${token}`

    const { error: emailError } = await resend.emails.send({
      from: "Circle <noreply@omnipointtechnology.com>",
      to: [email],
      subject: "Verify your Circle account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your Circle account</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Circle</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Welcome to Circle, ${firstName}!</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
                Thanks for signing up! Please verify your email address to complete your account setup.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #94a3b8;">
              <p>© 2024 Circle. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (emailError) {
      console.error("[v0] Email sending error:", emailError)
      return NextResponse.json({ success: false, error: "Failed to send verification email" }, { status: 500 })
    }

    console.log("[v0] Verification email sent to:", email)
    return NextResponse.json({
      success: true,
      message: "Please check your email to verify your account and complete signup",
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request. Please check your information and try again.",
      },
      { status: 400 },
    )
  }
}
