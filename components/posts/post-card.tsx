"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { CommentsSection } from "./comments-section"

interface PostCardProps {
  post: {
    id: string
    content: string
    created_at: string
    likes_count: number
    comments_count: number
    user_has_liked: boolean
    author: {
      id: string
      first_name: string
      last_name: string
      headline?: string
      avatar_url?: string
      is_verified?: boolean
    }
  }
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.user_has_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        if (!error) {
          setIsLiked(false)
          setLikesCount((prev) => prev - 1)
        }
      } else {
        // Like
        const { error } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        if (!error) {
          setIsLiked(true)
          setLikesCount((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Post header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author.id}`}>
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={post.author.avatar_url || "/placeholder.svg"}
                    alt={`${post.author.first_name} ${post.author.last_name}`}
                  />
                  <AvatarFallback>
                    {post.author.first_name[0]}
                    {post.author.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-semibold text-gray-900 hover:text-purple-600"
                  >
                    {post.author.first_name} {post.author.last_name}
                  </Link>
                  {post.author.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                {post.author.headline && <p className="text-sm text-gray-600">{post.author.headline}</p>}
                <p className="text-xs text-gray-500">{timeAgo}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <span className="text-lg">⋯</span>
            </Button>
          </div>

          {/* Post content */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Engagement stats */}
          {(likesCount > 0 || post.comments_count > 0) && (
            <div className="flex items-center justify-between py-2 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {likesCount > 0 && (
                  <span>
                    {likesCount} {likesCount === 1 ? "like" : "likes"}
                  </span>
                )}
                {post.comments_count > 0 && (
                  <span>
                    {post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 ${isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"}`}
            >
              <span className={`text-lg ${isLiked ? "text-red-600" : ""}`}>{isLiked ? "❤️" : "🤍"}</span>
              Like
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
              onClick={() => setShowComments(true)}
            >
              <span className="text-lg">💬</span>
              Comment
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <span className="text-lg">📤</span>
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentsSection
        postId={post.id}
        currentUserId={currentUserId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  )
}
