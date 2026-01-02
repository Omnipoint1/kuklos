"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostCard } from "@/components/posts/post-card"
import { Loader2 } from "lucide-react"

interface FeedPostsProps {
  initialPosts: any[]
  currentUserId: string
}

export function FeedPosts({ initialPosts, currentUserId }: FeedPostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchPosts = async () => {
    console.log("[v0] FeedPosts: Fetching posts...")
    setLoading(true)

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:users!posts_author_id_fkey(
          id,
          first_name,
          last_name,
          headline,
          avatar_url,
          is_verified
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] FeedPosts: Error fetching posts:", error)
      setLoading(false)
      return
    }

    console.log("[v0] FeedPosts: Fetched", posts?.length || 0, "posts")

    // Get like counts and user's likes
    const postIds = posts?.map((post) => post.id) || []
    const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds)

    // Get comment counts
    const { data: comments } = await supabase.from("comments").select("post_id").in("post_id", postIds)

    const postsWithInteractions =
      posts?.map((post) => {
        const postLikes = likes?.filter((like) => like.post_id === post.id) || []
        const postComments = comments?.filter((comment) => comment.post_id === post.id) || []
        const userHasLiked = postLikes.some((like) => like.user_id === currentUserId)

        return {
          ...post,
          likes_count: postLikes.length,
          comments_count: postComments.length,
          user_has_liked: userHasLiked,
        }
      }) || []

    setPosts(postsWithInteractions)
    setLoading(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("[v0] FeedPosts: Realtime change detected:", payload.eventType)
          // Refetch posts when any change occurs
          fetchPosts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Circle!</h3>
        <p className="text-gray-600 mb-4">Start by creating your first post or connecting with professionals.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
