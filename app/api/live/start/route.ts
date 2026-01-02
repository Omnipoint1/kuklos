import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateLiveKitToken } from "@/lib/livekit"

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

    const { title, description } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Generate unique room name
    const roomName = `live_${user.id}_${Date.now()}`

    // Create live stream record
    const { data: liveStream, error: dbError } = await supabase
      .from("live_streams")
      .insert({
        user_id: user.id,
        room_name: roomName,
        title: title.trim(),
        description: description?.trim() || null,
        is_live: true,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to create live stream" }, { status: 500 })
    }

    // Generate LiveKit token for the host
    const token = generateLiveKitToken(roomName, user.id, true)

    return NextResponse.json({
      liveStream,
      token,
      wsUrl: process.env.LIVEKIT_URL,
    })
  } catch (error) {
    console.error("Start live stream error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
