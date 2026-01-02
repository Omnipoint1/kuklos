import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, amount, rewardTier, message, isAnonymous } = body

    // Validate input
    if (!campaignId || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid pledge data" }, { status: 400 })
    }

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, is_active, current_amount, backers_count")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign || !campaign.is_active) {
      return NextResponse.json({ error: "Campaign not found or inactive" }, { status: 404 })
    }

    // Create pledge
    const { data: pledge, error: pledgeError } = await supabase
      .from("pledges")
      .insert({
        campaign_id: campaignId,
        backer_id: user.id,
        amount: amount,
        reward_tier: rewardTier || null,
        message: message || null,
        is_anonymous: isAnonymous || false,
        payment_status: "completed", // In production, this would be 'pending'
      })
      .select()
      .single()

    if (pledgeError) {
      console.error("Error creating pledge:", pledgeError)
      return NextResponse.json({ error: "Failed to create pledge" }, { status: 500 })
    }

    // Update campaign totals
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        current_amount: campaign.current_amount + amount,
        backers_count: campaign.backers_count + 1,
      })
      .eq("id", campaignId)

    if (updateError) {
      console.error("Error updating campaign:", updateError)
      // Note: In production, you'd want to handle this more carefully
      // possibly with database transactions
    }

    return NextResponse.json({
      success: true,
      pledge: pledge,
    })
  } catch (error) {
    console.error("Error processing pledge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")

    let query = supabase
      .from("pledges")
      .select(`
        *,
        campaigns (title, image_url),
        users (first_name, last_name, avatar_url)
      `)
      .eq("backer_id", user.id)
      .order("created_at", { ascending: false })

    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    const { data: pledges, error } = await query

    if (error) {
      console.error("Error fetching pledges:", error)
      return NextResponse.json({ error: "Failed to fetch pledges" }, { status: 500 })
    }

    return NextResponse.json({ pledges })
  } catch (error) {
    console.error("Error fetching pledges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
