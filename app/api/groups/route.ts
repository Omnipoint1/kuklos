import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const joined_only = searchParams.get("joined_only") === "true"

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase.from("groups").select(`
        *,
        created_by:users!groups_created_by_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        group_members!inner(
          user_id,
          role
        )
      `)

    // Apply filters
    if (category && category !== "All") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (joined_only) {
      query = query.eq("group_members.user_id", user.id)
    }

    const { data: groups, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process groups to add user membership status
    const processedGroups = groups?.map((group) => ({
      ...group,
      isJoined: group.group_members?.some((member: any) => member.user_id === user.id) || false,
      isAdmin:
        group.group_members?.some((member: any) => member.user_id === user.id && member.role === "admin") || false,
    }))

    return NextResponse.json({ groups: processedGroups })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { name, description, category, is_private } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: name.trim(),
        description: description?.trim() || "",
        category: category || "General",
        is_private: is_private || false,
        created_by: user.id,
        member_count: 1,
      })
      .select()
      .single()

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 })
    }

    // Add creator as admin member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "admin",
    })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
