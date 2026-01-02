import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const groupId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select(`
        *,
        created_by:users!groups_created_by_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("id", groupId)
      .single()

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 })
    }

    // Get user's membership status
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single()

    // Get group members
    const { data: members } = await supabase
      .from("group_members")
      .select(`
        role,
        joined_at,
        user:users!group_members_user_id_fkey(
          id,
          first_name,
          last_name,
          headline,
          avatar_url
        )
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true })

    // Get group posts (we'll use regular posts for now)
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          first_name,
          last_name,
          headline,
          avatar_url,
          is_verified
        )
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(20)

    const processedGroup = {
      ...group,
      isJoined: !!membership,
      isAdmin: membership?.role === "admin",
      isModerator: membership?.role === "moderator" || membership?.role === "admin",
      members: members || [],
      posts: posts || [],
    }

    return NextResponse.json({ group: processedGroup })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
