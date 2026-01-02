import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/onboarding"

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      },
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name,
        email: data.user.email,
      })

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`https://www.kuklos.app${next}`)
      }
    }
  }

  const errorRedirect =
    process.env.NODE_ENV === "development"
      ? `${origin}/auth/login?error=Could not authenticate user`
      : `https://www.kuklos.app/auth/login?error=Could not authenticate user`

  return NextResponse.redirect(errorRedirect)
}
