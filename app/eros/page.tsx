"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, Star, MessageCircle, Calendar, ArrowLeft, Menu } from "lucide-react"
import Link from "next/link"

interface DatingProfile {
  id: string
  age: number
  faith_background: string
  denomination?: string
  church_involvement?: string
  relationship_goals?: string
  interests: string[]
  compatibility: number
  created_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    headline?: string
    avatar_url?: string
  }
}

export default function ErosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [faithFilter, setFaithFilter] = useState("all")
  const [ageFilter, setAgeFilter] = useState("all")
  const [profiles, setProfiles] = useState<DatingProfile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams()
      if (faithFilter !== "all") params.set("faith", faithFilter)
      if (ageFilter !== "all") {
        const [min, max] = ageFilter.split("-")
        if (min) params.set("age_min", min)
        if (max && max !== "+") params.set("age_max", max)
      }
      if (searchTerm) params.set("search", searchTerm)

      const response = await fetch(`/api/eros/profiles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [faithFilter, ageFilter, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/feed" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Feed
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500" />
                <h1 className="text-xl font-bold text-gray-900">Eros</h1>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-rose-500" />
            <h1 className="text-4xl font-bold text-gray-900">Eros</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with like-minded individuals who share your faith and values. Build meaningful relationships rooted
            in spiritual foundation.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={faithFilter} onValueChange={setFaithFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Faith" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faiths</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Catholic">Catholic</SelectItem>
                  <SelectItem value="Jewish">Jewish</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="20-29">20-29</SelectItem>
                  <SelectItem value="30-39">30-39</SelectItem>
                  <SelectItem value="40+">40+</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="w-24 h-24 mx-auto mb-3">
                    <AvatarImage
                      src={profile.user.avatar_url || "/placeholder.svg"}
                      alt={`${profile.user.first_name} ${profile.user.last_name}`}
                    />
                    <AvatarFallback className="text-lg">
                      {profile.user.first_name[0]}
                      {profile.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profile.user.first_name} {profile.user.last_name}
                  </h3>
                  <p className="text-gray-600">{profile.age} years old</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Faith:</span>
                    <Badge variant="secondary">{profile.faith_background}</Badge>
                  </div>
                  {profile.denomination && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Denomination:</span>
                      <span className="text-sm text-gray-600">{profile.denomination}</span>
                    </div>
                  )}
                  {profile.church_involvement && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Church Role:</span>
                      <span className="text-sm text-gray-600">{profile.church_involvement}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Compatibility:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-green-600">{profile.compatibility}%</span>
                    </div>
                  </div>
                </div>

                {profile.relationship_goals && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.relationship_goals}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.interests.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1 bg-rose-500 hover:bg-rose-600">
                    <Link href={`/eros/${profile.id}`}>
                      <Heart className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
            <p className="text-gray-500">Try adjusting your search criteria to find more profiles.</p>
          </div>
        )}
      </div>
    </div>
  )
}
