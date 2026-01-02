import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendConnectionRequestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { addressee_id, message } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!addressee_id) {
      return NextResponse.json({ error: "Addressee ID is required" }, { status: 400 })
    }

    if (user.id === addressee_id) {
      return NextResponse.json({ error: "Cannot connect to yourself" }, { status: 400 })
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("id, status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .or(`requester_id.eq.${addressee_id},addressee_id.eq.${addressee_id}`)
      .single()

    if (existingConnection) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 })
    }

    const { data: connection, error } = await supabase
      .from("connections")
      .insert({
        requester_id: user.id,
        addressee_id,
        status: "pending",
        message: message?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single()

    const { data: addresseeProfile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", addressee_id)
      .single()

    await supabase.from("notifications").insert({
      user_id: addressee_id,
      type: "connection_request",
      title: "New Connection Request",
      message: `${requesterProfile?.first_name} ${requesterProfile?.last_name} wants to connect with you`,
      data: {
        connectionId: connection.id,
        userId: user.id,
        name: `${requesterProfile?.first_name} ${requesterProfile?.last_name}`,
        avatar: requesterProfile?.avatar_url,
        message: message,
      },
    })

    if (addresseeProfile?.email && requesterProfile) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        await sendConnectionRequestEmail({
          to: addresseeProfile.email,
          senderName: `${requesterProfile.first_name} ${requesterProfile.last_name}`,
          senderHandle: user.email?.split("@")[0] || "user",
          acceptUrl: `${baseUrl}/network?request=${connection.id}`,
        })
      } catch (emailError) {
        console.error("Failed to send connection request email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
