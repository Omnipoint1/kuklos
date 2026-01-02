import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      return NextResponse.json({ error: "Post already liked" }, { status: 400 })
    }

    const { data: post } = await supabase.from("posts").select("user_id, content").eq("id", postId).single()

    // Add like
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (post && post.user_id !== user.id) {
      const { data: likerProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single()

      await supabase.from("notifications").insert({
        user_id: post.user_id,
        type: "post_like",
        title: "Someone liked your post",
        message: `${likerProfile?.first_name} ${likerProfile?.last_name} liked your post`,
        data: {
          postId: postId,
          userId: user.id,
          name: `${likerProfile?.first_name} ${likerProfile?.last_name}`,
          avatar: likerProfile?.avatar_url,
          postContent: post.content?.substring(0, 100) + (post.content?.length > 100 ? "..." : ""),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
