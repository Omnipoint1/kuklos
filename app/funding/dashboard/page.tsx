"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, TrendingUp, Users, DollarSign, Calendar, Eye, Edit, MoreHorizontal, Target } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  backers_count: number
  category: string
  image_url: string | null
  end_date: string
  created_at: string
  is_active: boolean
}

interface Pledge {
  id: string
  amount: number
  created_at: string
  is_anonymous: boolean
  message: string | null
  reward_tier: string | null
  users: {
    first_name: string
    last_name: string
    avatar_url: string | null
  } | null
  campaigns: {
    title: string
  }
}

interface DashboardStats {
  totalRaised: number
  totalBackers: number
  activeCampaigns: number
  totalCampaigns: number
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRaised: 0,
    totalBackers: 0,
    activeCampaigns: 0,
    totalCampaigns: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })

      if (campaignsError) throw campaignsError

      // Fetch pledges to user's campaigns
      const { data: pledgesData, error: pledgesError } = await supabase
        .from("pledges")
        .select(`
          *,
          users (first_name, last_name, avatar_url),
          campaigns (title)
        `)
        .in("campaign_id", campaignsData?.map((c) => c.id) || [])
        .order("created_at", { ascending: false })

      if (pledgesError) throw pledgesError

      setCampaigns(campaignsData || [])
      setPledges(pledgesData || [])

      // Calculate stats
      const totalRaised = campaignsData?.reduce((sum, campaign) => sum + campaign.current_amount, 0) || 0
      const totalBackers = campaignsData?.reduce((sum, campaign) => sum + campaign.backers_count, 0) || 0
      const activeCampaigns = campaignsData?.filter((campaign) => campaign.is_active).length || 0
      const totalCampaigns = campaignsData?.length || 0

      setStats({
        totalRaised,
        totalBackers,
        activeCampaigns,
        totalCampaigns,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Campaign Dashboard</h1>
            <p className="text-muted-foreground">Manage your campaigns and track their performance</p>
          </div>
          <Button asChild>
            <Link href="/funding/create">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRaised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackers}</div>
              <p className="text-xs text-muted-foreground">People supporting you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="pledges">Recent Pledges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>Your currently running campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  {campaigns.filter((c) => c.is_active).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No active campaigns</p>
                      <Button asChild size="sm">
                        <Link href="/funding/create">Create Your First Campaign</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns
                        .filter((c) => c.is_active)
                        .slice(0, 3)
                        .map((campaign) => (
                          <div key={campaign.id} className="flex items-center gap-3">
                            {campaign.image_url && (
                              <img
                                src={campaign.image_url || "/placeholder.svg"}
                                alt={campaign.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{campaign.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress
                                  value={getProgressPercentage(campaign.current_amount, campaign.goal_amount)}
                                  className="h-1 flex-1"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(getProgressPercentage(campaign.current_amount, campaign.goal_amount))}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Pledges */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Pledges</CardTitle>
                  <CardDescription>Latest support from your backers</CardDescription>
                </CardHeader>
                <CardContent>
                  {pledges.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No pledges yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pledges.slice(0, 5).map((pledge) => (
                        <div key={pledge.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={pledge.users?.avatar_url || undefined} />
                            <AvatarFallback>
                              {pledge.is_anonymous
                                ? "A"
                                : `${pledge.users?.first_name?.[0]}${pledge.users?.last_name?.[0]}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {pledge.is_anonymous
                                ? "Anonymous"
                                : `${pledge.users?.first_name} ${pledge.users?.last_name}`}{" "}
                              pledged ${pledge.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(pledge.created_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first campaign to start raising funds for your project.
                  </p>
                  <Button asChild>
                    <Link href="/funding/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={campaign.image_url || "/placeholder.svg?height=200&width=400"}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={campaign.is_active ? "default" : "secondary"}>
                          {campaign.is_active ? "Active" : "Ended"}
                        </Badge>
                        <Badge variant="outline">{campaign.category}</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/funding/campaign/${campaign.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Campaign
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/funding/campaign/${campaign.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Campaign
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">${campaign.current_amount.toLocaleString()}</span>
                            <span className="text-muted-foreground">
                              {Math.round(getProgressPercentage(campaign.current_amount, campaign.goal_amount))}%
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercentage(campaign.current_amount, campaign.goal_amount)}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            of ${campaign.goal_amount.toLocaleString()} goal
                          </p>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{campaign.backers_count} backers</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{getDaysLeft(campaign.end_date)} days left</span>
                          </div>
                        </div>

                        <Button asChild className="w-full bg-transparent" variant="outline">
                          <Link href={`/funding/campaign/${campaign.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pledges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Pledges</CardTitle>
                <CardDescription>Complete list of pledges to your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {pledges.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No pledges yet</h3>
                    <p className="text-muted-foreground">Pledges to your campaigns will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pledges.map((pledge) => (
                      <div key={pledge.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={pledge.users?.avatar_url || undefined} />
                            <AvatarFallback>
                              {pledge.is_anonymous
                                ? "A"
                                : `${pledge.users?.first_name?.[0]}${pledge.users?.last_name?.[0]}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {pledge.is_anonymous
                                ? "Anonymous Backer"
                                : `${pledge.users?.first_name} ${pledge.users?.last_name}`}
                            </p>
                            <p className="text-sm text-muted-foreground">{pledge.campaigns?.title}</p>
                            {pledge.message && (
                              <p className="text-sm text-muted-foreground italic mt-1">"{pledge.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${pledge.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(pledge.created_at), "MMM d, yyyy")}
                          </p>
                          {pledge.reward_tier && (
                            <Badge variant="outline" className="mt-1">
                              {pledge.reward_tier}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
