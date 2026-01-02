import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendConnectionAcceptedEmail } from "@/lib/email"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: connectionId } = await params
    const { action } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get the connection to verify user can modify it
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single()

    if (fetchError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // Only the addressee can accept/decline
    if (connection.addressee_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to modify this connection" }, { status: 403 })
    }

    if (action === "accept") {
      const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const { data: accepterProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single()

      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", connection.requester_id)
        .single()

      await supabase.from("notifications").insert({
        user_id: connection.requester_id,
        type: "connection_accepted",
        title: "Connection Request Accepted",
        message: `${accepterProfile?.first_name} ${accepterProfile?.last_name} accepted your connection request`,
        data: {
          connectionId: connection.id,
          userId: user.id,
          name: `${accepterProfile?.first_name} ${accepterProfile?.last_name}`,
          avatar: accepterProfile?.avatar_url,
        },
      })

      if (requesterProfile?.email && accepterProfile) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          await sendConnectionAcceptedEmail({
            to: requesterProfile.email,
            senderName: `${accepterProfile.first_name} ${accepterProfile.last_name}`,
            profileUrl: `${baseUrl}/profile/${user.id}`,
          })
        } catch (emailError) {
          console.error("Failed to send connection accepted email:", emailError)
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json({ success: true, status: "accepted" })
    } else if (action === "decline") {
      const { error } = await supabase.from("connections").delete().eq("id", connectionId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, status: "declined" })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: connectionId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the connection to verify user can delete it
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single()

    if (fetchError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // User can delete if they are either the requester or addressee
    if (connection.requester_id !== user.id && connection.addressee_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this connection" }, { status: 403 })
    }

    const { error } = await supabase.from("connections").delete().eq("id", connectionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
