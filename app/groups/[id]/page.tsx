"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { FeedLayout } from "@/components/feed/feed-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Settings,
  Lock,
  Globe,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Send,
  ImageIcon,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"

// Mock group data
const mockGroup = {
  id: 1,
  name: "Tech Innovators",
  description:
    "A community for technology enthusiasts and innovators to share ideas and collaborate on cutting-edge projects.",
  members: 1247,
  posts: 89,
  privacy: "public",
  category: "Technology",
  image: "/diverse-tech-team.png",
  isJoined: true,
  isAdmin: false,
  createdAt: "2023-06-15",
  rules: [
    "Be respectful and professional",
    "No spam or self-promotion without permission",
    "Stay on topic - focus on technology and innovation",
    "Share knowledge and help others learn",
  ],
}

// Mock posts data
const mockPosts = [
  {
    id: 1,
    author: {
      id: 1,
      name: "Sarah Chen",
      avatar: "/placeholder.svg?key=sarah",
      title: "Senior Software Engineer",
    },
    content:
      "Just discovered this amazing new framework for building real-time applications. The performance improvements are incredible! Has anyone else tried it yet?",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    isLiked: false,
    image: null,
  },
  {
    id: 2,
    author: {
      id: 2,
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?key=marcus",
      title: "Tech Lead",
    },
    content:
      "Sharing some insights from our recent migration to microservices. The key lessons we learned and how it improved our deployment process.",
    timestamp: "4 hours ago",
    likes: 31,
    comments: 12,
    isLiked: true,
    image: "/placeholder.svg?height=200&width=400&key=microservices",
  },
  {
    id: 3,
    author: {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?key=emily",
      title: "Product Manager",
    },
    content:
      "Looking for recommendations on the best tools for API documentation. We're scaling our platform and need something that can grow with us.",
    timestamp: "1 day ago",
    likes: 18,
    comments: 15,
    isLiked: false,
    image: null,
  },
]

// Mock members data
const mockMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/placeholder.svg?key=sarah",
    title: "Senior Software Engineer",
    role: "Admin",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "/placeholder.svg?key=marcus",
    title: "Tech Lead",
    role: "Moderator",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "/placeholder.svg?key=emily",
    title: "Product Manager",
    role: "Member",
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "/placeholder.svg?key=david",
    title: "Full Stack Developer",
    role: "Member",
  },
]

export default function GroupPage() {
  const params = useParams()
  const [newPost, setNewPost] = useState("")
  const [activeTab, setActiveTab] = useState("posts")

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Handle post submission
      console.log("New post:", newPost)
      setNewPost("")
    }
  }

  return (
    <FeedLayout>
      <div className="space-y-6">
        {/* Group Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={mockGroup.image || "/placeholder.svg"} alt={mockGroup.name} />
                <AvatarFallback className="text-2xl">{mockGroup.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{mockGroup.name}</h1>
                      {mockGroup.privacy === "private" ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Globe className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mb-3">
                      {mockGroup.category}
                    </Badge>
                    <p className="text-gray-600 mb-4">{mockGroup.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{mockGroup.members.toLocaleString()} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{mockGroup.posts} posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(mockGroup.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant={mockGroup.isJoined ? "outline" : "default"}>
                      {mockGroup.isJoined ? "Joined" : "Join Group"}
                    </Button>
                    {mockGroup.isAdmin && (
                      <Button variant="outline" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Create Post */}
            {mockGroup.isJoined && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share something with the group..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link
                        </Button>
                      </div>
                      <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                            <p className="text-sm text-gray-500">
                              {post.author.title} • {post.timestamp}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-gray-700 mb-3">{post.content}</p>

                        {post.image && (
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post content"
                            className="w-full rounded-lg mb-3 max-h-64 object-cover"
                          />
                        )}

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <Button variant="ghost" size="sm" className={post.isLiked ? "text-red-600" : ""}>
                            <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${member.id}`}>
                          <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {member.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-600 truncate">{member.title}</p>
                        <Badge
                          variant={
                            member.role === "Admin" ? "default" : member.role === "Moderator" ? "secondary" : "outline"
                          }
                          className="text-xs mt-1"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About this group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{mockGroup.description}</p>

                <div>
                  <h4 className="font-semibold mb-2">Group Rules</h4>
                  <ul className="space-y-1">
                    {mockGroup.rules.map((rule, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Privacy</p>
                    <p className="font-semibold capitalize">{mockGroup.privacy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-semibold">{new Date(mockGroup.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeedLayout>
  )
}
