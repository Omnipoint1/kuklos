import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const faith = searchParams.get("faith")
    const age_min = searchParams.get("age_min")
    const age_max = searchParams.get("age_max")
    const search = searchParams.get("search")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
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
      .eq("is_active", true)
      .neq("user_id", user.id) // Don't show current user's profile

    // Apply filters
    if (faith && faith !== "all") {
      query = query.eq("faith_background", faith)
    }

    if (age_min) {
      query = query.gte("age", Number.parseInt(age_min))
    }

    if (age_max) {
      query = query.lte("age", Number.parseInt(age_max))
    }

    if (search) {
      query = query.or(`interests.cs.{${search}},relationship_goals.ilike.%${search}%`)
    }

    const { data: profiles, error } = await query.order("created_at", { ascending: false }).limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate compatibility scores (simplified algorithm)
    const processedProfiles = profiles?.map((profile) => ({
      ...profile,
      compatibility: Math.floor(Math.random() * 20) + 80, // Mock compatibility for now
    }))

    return NextResponse.json({ profiles: processedProfiles })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const profileData = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a dating profile
    const { data: existingProfile } = await supabase
      .from("dating_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: "Dating profile already exists" }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from("dating_profiles")
      .insert({
        user_id: user.id,
        ...profileData,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
