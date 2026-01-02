"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

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

interface Reward {
  id: string
  title: string
  description: string
  amount: number
  estimatedDelivery: Date | undefined
  isLimited: boolean
  quantityLimit?: number
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [endDate, setEndDate] = useState<Date>()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [rewards, setRewards] = useState<Reward[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    category: "",
    videoUrl: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addReward = () => {
    const newReward: Reward = {
      id: Date.now().toString(),
      title: "",
      description: "",
      amount: 0,
      estimatedDelivery: undefined,
      isLimited: false,
    }
    setRewards([...rewards, newReward])
  }

  const updateReward = (id: string, field: keyof Reward, value: any) => {
    setRewards(rewards.map((reward) => (reward.id === id ? { ...reward, [field]: value } : reward)))
  }

  const removeReward = (id: string) => {
    setRewards(rewards.filter((reward) => reward.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          description: "Please sign in to create a campaign.",
          variant: "destructive",
        })
        return
      }

      let imageUrl = ""

      // Upload image if provided
      if (imageFile) {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: imageFile,
        })

        if (response.ok) {
          const data = await response.json()
          imageUrl = data.url
        }
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          title: formData.title,
          description: formData.description,
          goal_amount: Number.parseFloat(formData.goalAmount),
          category: formData.category,
          creator_id: user.id,
          end_date: endDate?.toISOString(),
          image_url: imageUrl,
          video_url: formData.videoUrl || null,
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Create rewards
      if (rewards.length > 0) {
        const rewardData = rewards.map((reward) => ({
          campaign_id: campaign.id,
          title: reward.title,
          description: reward.description,
          amount: reward.amount,
          estimated_delivery: reward.estimatedDelivery?.toISOString().split("T")[0],
          is_limited: reward.isLimited,
          quantity_limit: reward.isLimited ? reward.quantityLimit : null,
        }))

        const { error: rewardsError } = await supabase.from("campaign_rewards").insert(rewardData)

        if (rewardsError) throw rewardsError
      }

      toast({
        title: "Campaign created successfully!",
        description: "Your campaign is now live and accepting pledges.",
      })

      router.push(`/funding/campaign/${campaign.id}`)
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error creating campaign",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Campaign</h1>
          <p className="text-muted-foreground">
            Share your project with the world and get the funding you need to make it happen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your project and what makes it special.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your campaign a compelling title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project in detail. What are you creating? Why is it important?"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goalAmount">Funding Goal ($) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                    placeholder="25000"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Campaign End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Add images and videos to showcase your project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image">Campaign Image</Label>
                <div className="mt-2">
                  <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload an image</p>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>Create reward tiers to incentivize backers at different pledge levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <div key={reward.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Reward Tier {index + 1}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeReward(reward.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Reward Title</Label>
                        <Input
                          value={reward.title}
                          onChange={(e) => updateReward(reward.id, "title", e.target.value)}
                          placeholder="Early Bird Special"
                        />
                      </div>
                      <div>
                        <Label>Pledge Amount ($)</Label>
                        <Input
                          type="number"
                          value={reward.amount}
                          onChange={(e) => updateReward(reward.id, "amount", Number.parseFloat(e.target.value) || 0)}
                          placeholder="25"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={reward.description}
                        onChange={(e) => updateReward(reward.id, "description", e.target.value)}
                        placeholder="What will backers receive for this pledge amount?"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addReward} className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reward Tier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Launch Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
