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

    const { roomName } = await request.json()

    if (!roomName) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    // Verify the user owns this live stream
    const { data: liveStream, error: dbError } = await supabase
      .from("live_streams")
      .select("*")
      .eq("room_name", roomName)
      .eq("user_id", user.id)
      .eq("is_live", true)
      .single()

    if (dbError || !liveStream) {
      return NextResponse.json({ error: "Live stream not found or unauthorized" }, { status: 404 })
    }

    // Generate LiveKit token for the host
    const token = generateLiveKitToken(roomName, user.id, true)

    return NextResponse.json({
      liveStream,
      token,
      wsUrl: process.env.LIVEKIT_URL,
    })
  } catch (error) {
    console.error("Host live stream error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
