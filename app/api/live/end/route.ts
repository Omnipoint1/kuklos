import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomName } = await request.json()

    if (!roomName) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    // End the live stream
    const { error: dbError } = await supabase
      .from("live_streams")
      .update({
        is_live: false,
        ended_at: new Date().toISOString(),
      })
      .eq("room_name", roomName)
      .eq("user_id", user.id)

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to end live stream" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("End live stream error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
