import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Search, TrendingUp, Users, Clock, Target } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

// Mock data for featured campaigns
const featuredCampaigns = [
  {
    id: "1",
    title: "Revolutionary Solar Backpack",
    description: "A backpack that charges your devices using solar energy while you walk.",
    goal: 50000,
    current: 32500,
    backers: 245,
    daysLeft: 12,
    category: "Technology",
    image: "/solar-backpack-technology.jpg",
    creator: "EcoTech Innovations",
  },
  {
    id: "2",
    title: "Community Garden Project",
    description: "Building sustainable community gardens in urban neighborhoods.",
    goal: 25000,
    current: 18750,
    backers: 156,
    daysLeft: 8,
    category: "Environment",
    image: "/urban-community-garden.png",
    creator: "Green City Initiative",
  },
  {
    id: "3",
    title: "Indie Game: Pixel Adventures",
    description: "A nostalgic pixel art adventure game with modern gameplay mechanics.",
    goal: 75000,
    current: 45000,
    backers: 892,
    daysLeft: 25,
    category: "Games",
    image: "/pixel-art-game-adventure.jpg",
    creator: "Retro Studios",
  },
]

const categories = [
  "Technology",
  "Games",
  "Design",
  "Film",
  "Music",
  "Art",
  "Food",
  "Fashion",
  "Environment",
  "Education",
]

export default function FundingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Circle <span className="text-primary">Funding</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Bring creative projects to life through community support. Discover innovative ideas and help make them
              reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/funding/create">Start a Campaign</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/funding/explore">Explore Projects</Link>
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search campaigns..." className="pl-10 bg-card border-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-foreground">$2.5M</span>
              </div>
              <p className="text-muted-foreground">Total Funded</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-foreground">15K</span>
              </div>
              <p className="text-muted-foreground">Backers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-foreground">342</span>
              </div>
              <p className="text-muted-foreground">Projects Funded</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-foreground">89%</span>
              </div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Campaigns</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the most exciting projects from our community of creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={campaign.image || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {campaign.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  <p className="text-sm text-muted-foreground">by {campaign.creator}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">${campaign.current.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          {Math.round((campaign.current / campaign.goal) * 100)}%
                        </span>
                      </div>
                      <Progress value={(campaign.current / campaign.goal) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">of ${campaign.goal.toLocaleString()} goal</p>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{campaign.backers} backers</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/funding/campaign/${campaign.id}`}>View Campaign</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore Categories</h2>
            <p className="text-muted-foreground">Find projects that match your interests</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                asChild
                className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              >
                <Link href={`/funding/explore?category=${category.toLowerCase()}`}>{category}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
