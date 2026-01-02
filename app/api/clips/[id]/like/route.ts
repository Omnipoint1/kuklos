import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const clipId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already liked this clip
    const { data: existingLike } = await supabase
      .from("clip_likes")
      .select("id")
      .eq("clip_id", clipId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      return NextResponse.json({ error: "Already liked this clip" }, { status: 400 })
    }

    // Add like
    const { error: likeError } = await supabase.from("clip_likes").insert({
      clip_id: clipId,
      user_id: user.id,
    })

    if (likeError) {
      return NextResponse.json({ error: likeError.message }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("increment_clip_likes", {
      clip_id: clipId,
    })

    if (updateError) {
      console.error("Failed to update likes count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const clipId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove like
    const { error: unlikeError } = await supabase
      .from("clip_likes")
      .delete()
      .eq("clip_id", clipId)
      .eq("user_id", user.id)

    if (unlikeError) {
      return NextResponse.json({ error: unlikeError.message }, { status: 500 })
    }

    // Update likes count
    const { error: updateError } = await supabase.rpc("decrement_clip_likes", {
      clip_id: clipId,
    })

    if (updateError) {
      console.error("Failed to update likes count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
