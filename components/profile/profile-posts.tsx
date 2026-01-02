"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostComposer } from "@/components/posts/post-composer"
import { PostCard } from "@/components/posts/post-card"
import { Loader2 } from "lucide-react"

interface ProfilePostsProps {
  userId: string
  user: any
  currentUserId: string
  isOwnProfile: boolean
  initialPosts: any[]
}

export function ProfilePosts({ userId, user, currentUserId, isOwnProfile, initialPosts }: ProfilePostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const { data: fetchedPosts } = await supabase
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
        .eq("author_id", userId)
        .order("created_at", { ascending: false })

      const postIds = fetchedPosts?.map((post) => post.id) || []
      const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds)
      const { data: comments } = await supabase.from("comments").select("post_id").in("post_id", postIds)

      const postsWithInteractions =
        fetchedPosts?.map((post) => {
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
    } catch (error) {
      console.error("[v0] Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel(`profile-posts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `author_id=eq.${userId}`,
        },
        () => {
          fetchPosts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="mb-6">
          <PostComposer user={user} />
        </div>
      )}

      {isLoading && posts.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isOwnProfile ? "You haven't posted yet" : "No posts yet"}
          </h3>
          <p className="text-gray-600">
            {isOwnProfile ? "Share your first post with your network!" : "This user hasn't shared any posts yet."}
          </p>
        </div>
      )}
    </div>
  )
}
