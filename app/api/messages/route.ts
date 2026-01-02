import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { thread_id, content } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!thread_id || !content?.trim()) {
      return NextResponse.json({ error: "Thread ID and content are required" }, { status: 400 })
    }

    // Verify user is part of the thread
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", thread_id)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .single()

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found or access denied" }, { status: 404 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        thread_id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update thread's last message time
    await supabase.from("message_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
