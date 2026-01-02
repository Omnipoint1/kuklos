import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const profileId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("dating_profiles")
      .select(`
        *,
        user:users!dating_profiles_user_id_fkey(
          id,
          first_name,
          last_name,
          headline,
          avatar_url,
          is_verified
        )
      `)
      .eq("id", profileId)
      .eq("is_active", true)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate compatibility score (simplified)
    const processedProfile = {
      ...profile,
      compatibility: Math.floor(Math.random() * 20) + 80,
    }

    return NextResponse.json({ profile: processedProfile })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
