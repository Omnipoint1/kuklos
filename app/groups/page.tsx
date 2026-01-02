"use client"

import { useState, useEffect } from "react"
import { FeedLayout } from "@/components/feed/feed-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, Search, Plus, Lock, Globe } from "lucide-react"
import Link from "next/link"

// Mock groups data
interface Group {
  id: string
  name: string
  description: string
  member_count: number
  category: string
  image_url?: string
  is_private: boolean
  isJoined: boolean
  created_at: string
}

const categories = ["All", "Youth", "Bible Study", "Business", "Worship", "Family", "Mission", "Singles", "Prayer"]

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showJoinedOnly, setShowJoinedOnly] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "All") params.set("category", selectedCategory)
      if (searchTerm) params.set("search", searchTerm)
      if (showJoinedOnly) params.set("joined_only", "true")

      const response = await fetch(`/api/groups?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [selectedCategory, searchTerm, showJoinedOnly])

  const handleJoinGroup = async (groupId: string, isJoined: boolean) => {
    try {
      const method = isJoined ? "DELETE" : "POST"
      const response = await fetch(`/api/groups/${groupId}/join`, { method })

      if (response.ok) {
        // Refresh groups list
        fetchGroups()
      }
    } catch (error) {
      console.error("Failed to join/leave group:", error)
    }
  }

  if (loading) {
    return (
      <FeedLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </FeedLayout>
    )
  }

  return (
    <FeedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600">Discover and join communities that match your interests</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Joined Filter */}
              <Button
                variant={showJoinedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJoinedOnly(!showJoinedOnly)}
              >
                My Groups
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={group.image_url || "/placeholder.svg"} alt={group.name} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/groups/${group.id}`}>
                        <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">{group.name}</CardTitle>
                      </Link>
                      {group.is_private ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {group.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant={group.isJoined ? "outline" : "default"}
                    onClick={() => handleJoinGroup(group.id, group.isJoined)}
                  >
                    {group.isJoined ? "Joined" : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters to find more groups.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </FeedLayout>
  )
}
