import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: clips, error } = await supabase
      .from("clips")
      .select(`
        *,
        author:users!clips_author_id_fkey(
          id,
          first_name,
          last_name,
          headline,
          avatar_url,
          is_verified
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get like counts and user's likes for each clip
    const clipIds = clips?.map((clip) => clip.id) || []
    const { data: likes } = await supabase.from("clip_likes").select("clip_id, user_id").in("clip_id", clipIds)

    // Process clips with interaction data
    const clipsWithInteractions =
      clips?.map((clip) => {
        const clipLikes = likes?.filter((like) => like.clip_id === clip.id) || []
        const userHasLiked = clipLikes.some((like) => like.user_id === user.id)

        return {
          ...clip,
          likes_count: clipLikes.length,
          user_has_liked: userHasLiked,
        }
      }) || []

    return NextResponse.json({ clips: clipsWithInteractions })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { title, description, video_url, thumbnail_url, duration } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!video_url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
    }

    const { data: clip, error } = await supabase
      .from("clips")
      .insert({
        author_id: user.id,
        title: title?.trim() || "",
        description: description?.trim() || "",
        video_url,
        thumbnail_url,
        duration: duration || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ clip }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
