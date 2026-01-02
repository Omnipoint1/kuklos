"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Users, Clock, Target, Calendar, MapPin } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  backers_count: number
  category: string
  image_url: string | null
  video_url: string | null
  creator_id: string
  end_date: string
  created_at: string
  users: {
    first_name: string
    last_name: string
    avatar_url: string | null
    bio: string | null
    location: string | null
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

interface Update {
  id: string
  title: string
  content: string
  created_at: string
}

export default function CampaignPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCampaignData(params.id as string)
    }
  }, [params.id])

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
          users (first_name, last_name, avatar_url, bio, location)
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

      // Fetch updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("campaign_updates")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false })

      if (updatesError) throw updatesError
      setUpdates(updatesData || [])
    } catch (error) {
      console.error("Error fetching campaign data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video bg-muted rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
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
          <p className="text-muted-foreground mb-8">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/funding/explore">Browse Campaigns</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground">
            <Link href="/funding" className="hover:text-foreground">
              Circle Funding
            </Link>
            <span className="mx-2">/</span>
            <Link href="/funding/explore" className="hover:text-foreground">
              Explore
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{campaign.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{campaign.category}</Badge>
                <Badge variant="outline" className="text-xs">
                  {getDaysLeft(campaign.end_date)} days left
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{campaign.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{campaign.description}</p>
            </div>

            {/* Media */}
            <div className="space-y-4">
              {campaign.image_url && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={campaign.image_url || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {campaign.video_url && (
                <div className="aspect-video">
                  <iframe
                    src={campaign.video_url.replace("watch?v=", "embed/")}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p>{campaign.description}</p>
                      {/* Add more detailed story content here */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-6">
                  {updates.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No updates yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    updates.map((update) => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{update.title}</CardTitle>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(update.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{update.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Comments coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <p className="text-sm text-muted-foreground mt-2">of ${campaign.goal_amount.toLocaleString()} goal</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-bold text-lg">{campaign.backers_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">backers</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-bold text-lg">{getDaysLeft(campaign.end_date)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">days left</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/funding/campaign/${campaign.id}/pledge`}>Back this project</Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.users?.avatar_url || undefined} />
                    <AvatarFallback>
                      {campaign.users?.first_name?.[0]}
                      {campaign.users?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {campaign.users?.first_name} {campaign.users?.last_name}
                    </h4>
                    {campaign.users?.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {campaign.users.location}
                      </div>
                    )}
                    {campaign.users?.bio && <p className="text-sm text-muted-foreground mt-2">{campaign.users.bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {rewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rewards</CardTitle>
                  <CardDescription>Support this project and get great rewards!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-foreground">{reward.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          ${reward.amount}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{reward.backers_count} backers</span>
                        {reward.estimated_delivery && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Est. {format(new Date(reward.estimated_delivery), "MMM yyyy")}
                          </div>
                        )}
                      </div>

                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/funding/campaign/${campaign.id}/pledge?reward=${reward.id}`}>Select Reward</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
