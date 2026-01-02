"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Users, Target } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  backers_count: number
  image_url: string | null
  users: {
    first_name: string
    last_name: string
  }
}

interface Reward {
  id: string
  title: string
  description: string
  amount: number
  estimated_delivery: string | null
  backers_count: number
  is_limited: boolean
  quantity_limit: number | null
}

export default function PledgePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedRewardId = searchParams.get("reward")

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCampaignData(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (selectedRewardId && rewards.length > 0) {
      const reward = rewards.find((r) => r.id === selectedRewardId)
      if (reward) {
        setSelectedReward(reward)
        setCustomAmount(reward.amount.toString())
      }
    }
  }, [selectedRewardId, rewards])

  const fetchCampaignData = async (campaignId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select(`
          *,
          users (first_name, last_name)
        `)
        .eq("id", campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("campaign_rewards")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("amount", { ascending: true })

      if (rewardsError) throw rewardsError
      setRewards(rewardsData || [])
    } catch (error) {
      console.error("Error fetching campaign data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePledge = async () => {
    if (!campaign) return

    const amount = Number.parseFloat(customAmount)
    if (!amount || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid pledge amount.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to make a pledge.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Create pledge
      const { data: pledge, error: pledgeError } = await supabase
        .from("pledges")
        .insert({
          campaign_id: campaign.id,
          backer_id: user.id,
          amount: amount,
          reward_tier: selectedReward?.title || null,
          message: message || null,
          is_anonymous: isAnonymous,
          payment_status: "completed", // In a real app, this would be 'pending' until payment is processed
        })
        .select()
        .single()

      if (pledgeError) throw pledgeError

      // Update campaign totals
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          current_amount: campaign.current_amount + amount,
          backers_count: campaign.backers_count + 1,
        })
        .eq("id", campaign.id)

      if (updateError) throw updateError

      // Update reward backer count if applicable
      if (selectedReward) {
        const { error: rewardUpdateError } = await supabase
          .from("campaign_rewards")
          .update({
            backers_count: selectedReward.backers_count + 1,
          })
          .eq("id", selectedReward.id)

        if (rewardUpdateError) throw rewardUpdateError
      }

      toast({
        title: "Pledge successful!",
        description: `Thank you for pledging $${amount} to this campaign.`,
      })

      router.push(`/funding/campaign/${campaign.id}?pledged=true`)
    } catch (error) {
      console.error("Error creating pledge:", error)
      toast({
        title: "Error processing pledge",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Campaign not found</h1>
          <Button asChild>
            <Link href="/funding/explore">Browse Campaigns</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/funding/campaign/${campaign.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaign
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Back this project</h1>
          <p className="text-muted-foreground">
            Support {campaign.users?.first_name} {campaign.users?.last_name} and help bring this project to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Summary */}
          <div className="space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {campaign.image_url && (
                    <img
                      src={campaign.image_url || "/placeholder.svg"}
                      alt={campaign.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      by {campaign.users?.first_name} {campaign.users?.last_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-bold text-foreground">
                        ${campaign.current_amount.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(getProgressPercentage(campaign.current_amount, campaign.goal_amount))}%
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(campaign.current_amount, campaign.goal_amount)}
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      of ${campaign.goal_amount.toLocaleString()} goal
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{campaign.backers_count} backers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {rewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a reward</CardTitle>
                  <CardDescription>Select a reward tier or pledge any amount</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* No reward option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      !selectedReward ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedReward(null)
                      setCustomAmount("")
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-foreground">Pledge without a reward</h4>
                        <p className="text-sm text-muted-foreground">Support the project with any amount</p>
                      </div>
                      <Badge variant="outline">Any amount</Badge>
                    </div>
                  </div>

                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedReward?.id === reward.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedReward(reward)
                        setCustomAmount(reward.amount.toString())
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{reward.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{reward.backers_count} backers</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          ${reward.amount}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pledge Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Make your pledge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount */}
                <div>
                  <Label htmlFor="amount">Pledge amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="25"
                    min="1"
                    step="0.01"
                    className="text-lg"
                  />
                  {selectedReward && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum ${selectedReward.amount} for this reward
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message to creator (optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share why you're supporting this project..."
                    rows={3}
                  />
                </div>

                {/* Anonymous */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Make this pledge anonymously
                  </Label>
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Pledge summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pledge amount:</span>
                      <span className="font-medium">${customAmount || "0"}</span>
                    </div>
                    {selectedReward && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reward:</span>
                        <span className="font-medium">{selectedReward.title}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${customAmount || "0"}</span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={handlePledge}
                  disabled={isLoading || !customAmount || Number.parseFloat(customAmount) < 1}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Processing..." : `Pledge $${customAmount || "0"}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By pledging, you agree to our terms of service. Your payment will be processed securely.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
