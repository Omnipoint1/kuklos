import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { PostComposer } from "@/components/posts/post-composer"
import { FeedPosts } from "@/components/feed/feed-posts"

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[v0] Feed: Loading for user:", user.id)

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: suggestedPeople } = await supabase
    .from("users")
    .select("id, first_name, last_name, headline, avatar_url, is_verified")
    .neq("id", user.id)
    .limit(5)

  const { data: posts, error: postsError } = await supabase
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

  console.log("[v0] Feed: Fetched posts count:", posts?.length || 0)
  if (postsError) {
    console.error("[v0] Feed: Error fetching posts:", postsError)
  }

  // Get like counts and user's likes
  const postIds = posts?.map((post) => post.id) || []
  const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds)

  // Get comment counts
  const { data: comments } = await supabase.from("comments").select("post_id").in("post_id", postIds)

  // Process posts with interaction data
  const postsWithInteractions =
    posts?.map((post) => {
      const postLikes = likes?.filter((like) => like.post_id === post.id) || []
      const postComments = comments?.filter((comment) => comment.post_id === post.id) || []
      const userHasLiked = postLikes.some((like) => like.user_id === user.id)

      return {
        ...post,
        likes_count: postLikes.length,
        comments_count: postComments.length,
        user_has_liked: userHasLiked,
      }
    }) || []

  return (
    <FeedLayout user={userProfile} suggestedPeople={suggestedPeople || []}>
      <div className="max-w-2xl mx-auto space-y-6">
        <PostComposer user={userProfile} />
        <FeedPosts initialPosts={postsWithInteractions} currentUserId={user.id} />
      </div>
    </FeedLayout>
  )
}
