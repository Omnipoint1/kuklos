"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { CommentsSection } from "./comments-section"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import Image from "next/image"

interface PostCardProps {
  post: {
    id: string
    content: string
    created_at: string
    likes_count: number
    comments_count: number
    user_has_liked: boolean
    media_urls?: string[]
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
  const [avatarError, setAvatarError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    try {
      if (isLiked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        if (!error) {
          setIsLiked(false)
          setLikesCount((prev) => prev - 1)
        }
      } else {
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

  const timeAgo = mounted ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ""

  return (
    <>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author.id}`}>
                <Avatar className="w-12 h-12 ring-2 ring-purple-200 hover:ring-purple-400 transition-all">
                  {!avatarError && post.author.avatar_url ? (
                    <AvatarImage
                      src={post.author.avatar_url || "/placeholder.svg"}
                      alt={`${post.author.first_name} ${post.author.last_name}`}
                      onError={() => setAvatarError(true)}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {post.author.first_name?.[0] || ""}
                    {post.author.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="font-bold text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {post.author.first_name} {post.author.last_name}
                  </Link>
                  {post.author.is_verified === true && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs px-2">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                {post.author.headline && <p className="text-sm text-gray-600 line-clamp-1">{post.author.headline}</p>}
                <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          <div className="mb-4">
            {post.content && (
              <p className="text-gray-900 whitespace-pre-wrap text-base leading-relaxed mb-3">{post.content}</p>
            )}

            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-2 rounded-xl overflow-hidden">
                {post.media_urls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg)$/i)
                  return isVideo ? (
                    <video key={index} src={url} controls className="w-full rounded-lg" />
                  ) : (
                    <div key={index} className="relative w-full aspect-video bg-gray-100">
                      <Image
                        src={url || "/placeholder.svg"}
                        alt="Post media"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {(likesCount > 0 || post.comments_count > 0) && (
            <div className="flex items-center justify-between py-3 mb-3 border-y border-gray-100">
              <div className="flex items-center gap-4 text-sm">
                {likesCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                    <span className="font-semibold text-gray-700">{likesCount}</span>
                  </div>
                )}
                {post.comments_count > 0 && (
                  <span className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors">
                    {post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex-1 rounded-xl font-semibold transition-all ${
                isLiked
                  ? "text-pink-600 bg-pink-50 hover:bg-pink-100"
                  : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
              }`}
            >
              <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-pink-600" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-xl font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Comment
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-xl font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <Share2 className="w-5 h-5 mr-2" />
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
