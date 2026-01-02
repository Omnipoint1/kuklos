import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { other_user_id } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!other_user_id) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
    }

    if (user.id === other_user_id) {
      return NextResponse.json({ error: "Cannot create thread with yourself" }, { status: 400 })
    }

    // Check if thread already exists
    const { data: existingThread } = await supabase
      .from("message_threads")
      .select("id")
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .or(`user_a_id.eq.${other_user_id},user_b_id.eq.${other_user_id}`)
      .single()

    if (existingThread) {
      return NextResponse.json({ thread: existingThread })
    }

    // Create new thread
    const { data: thread, error } = await supabase
      .from("message_threads")
      .insert({
        user_a_id: user.id < other_user_id ? user.id : other_user_id,
        user_b_id: user.id < other_user_id ? other_user_id : user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
