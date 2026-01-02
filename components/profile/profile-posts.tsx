"use client"

import { PostComposer } from "@/components/posts/post-composer"
import { PostCard } from "@/components/posts/post-card"

interface ProfilePostsProps {
  posts: any[]
  user: any
  currentUserId: string
  isOwnProfile: boolean
}

export function ProfilePosts({ posts, user, currentUserId, isOwnProfile }: ProfilePostsProps) {
  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="mb-6">
          <PostComposer user={user} />
        </div>
      )}

      {posts.length > 0 ? (
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
