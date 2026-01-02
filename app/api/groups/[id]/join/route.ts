import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const groupId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this group" }, { status: 400 })
    }

    // Add user to group
    const { error: joinError } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id,
      role: "member",
    })

    if (joinError) {
      return NextResponse.json({ error: joinError.message }, { status: 500 })
    }

    // Update member count
    const { error: updateError } = await supabase.rpc("increment_group_member_count", {
      group_id: groupId,
    })

    if (updateError) {
      console.error("Failed to update member count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const groupId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove user from group
    const { error: leaveError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id)

    if (leaveError) {
      return NextResponse.json({ error: leaveError.message }, { status: 500 })
    }

    // Update member count
    const { error: updateError } = await supabase.rpc("decrement_group_member_count", {
      group_id: groupId,
    })

    if (updateError) {
      console.error("Failed to update member count:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
