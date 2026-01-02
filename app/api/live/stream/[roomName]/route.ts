import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomName: string }> }) {
  try {
    const { roomName } = await params
    const supabase = await createClient()

    const { data: liveStream, error } = await supabase
      .from("live_streams")
      .select(`
        *,
        user:users(first_name, last_name, avatar_url)
      `)
      .eq("room_name", roomName)
      .eq("is_live", true)
      .single()

    if (error || !liveStream) {
      return NextResponse.json({ error: "Live stream not found" }, { status: 404 })
    }

    return NextResponse.json(liveStream)
  } catch (error) {
    console.error("Get live stream error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
