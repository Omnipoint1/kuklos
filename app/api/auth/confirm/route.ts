import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/auth-code-error?message=Invalid confirmation link`,
    )
  }

  try {
    const userData = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - userData.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/auth-code-error?message=Confirmation link has expired`,
      )
    }

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    })

    // Create the user with admin privileges (bypassing email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
      },
    })

    if (authError) {
      console.error("[v0] Auth creation error:", authError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/auth-code-error?message=Failed to create account`,
      )
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
      })

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
      }
    }

    console.log("[v0] User confirmed and created:", userData.email)

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?message=Account confirmed! Please sign in.`,
    )
  } catch (error) {
    console.error("[v0] Confirmation error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/auth-code-error?message=Invalid confirmation link`,
    )
  }
}
