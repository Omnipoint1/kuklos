import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { ProfileAbout } from "@/components/profile/profile-about"
import { ProfileExperience } from "@/components/profile/profile-experience"
import { ProfileSkills } from "@/components/profile/profile-skills"
import { ProfilePosts } from "@/components/profile/profile-posts"

interface ProfilePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { id } = await params
  const { tab = "about" } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  // Get profile user
  const { data: profileUser, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error || !profileUser) {
    redirect("/feed")
  }

  // Get user's experience
  const { data: experience } = await supabase
    .from("experience")
    .select("*")
    .eq("user_id", id)
    .order("start_date", { ascending: false })

  // Get user's education
  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("user_id", id)
    .order("start_date", { ascending: false })

  // Get user's skills
  const { data: skills } = await supabase.from("skills").select("*").eq("user_id", id)

  let postsWithInteractions = []
  if (tab === "posts") {
    const { data: posts } = await supabase
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
      .eq("author_id", id)
      .order("created_at", { ascending: false })

    // Get like counts and user's likes
    const postIds = posts?.map((post) => post.id) || []
    const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds)

    // Get comment counts
    const { data: comments } = await supabase.from("comments").select("post_id").in("post_id", postIds)

    // Process posts with interaction data
    postsWithInteractions =
      posts?.map((post) => {
        const postLikes = likes?.filter((like) => like.post_id === post.id) || []
        const postComments = comments?.filter((comment) => comment.post_id === post.id) || []
        const userHasLiked = postLikes.some((like) => like.user_id === currentUser.id)

        return {
          ...post,
          likes_count: postLikes.length,
          comments_count: postComments.length,
          user_has_liked: userHasLiked,
        }
      }) || []
  }

  // Get connection status if viewing someone else's profile
  let connectionStatus = null
  if (currentUser.id !== id) {
    const { data: connection } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
      .or(`requester_id.eq.${id},addressee_id.eq.${id}`)
      .single()

    if (connection) {
      connectionStatus = {
        status: connection.status,
        isRequester: connection.requester_id === currentUser.id,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader user={profileUser} currentUserId={currentUser.id} connectionStatus={connectionStatus} />

        <div className="px-4 sm:px-6 lg:px-8">
          <ProfileTabs activeTab={tab} userId={id} />

          <div className="mt-6">
            {tab === "about" && <ProfileAbout user={profileUser} />}
            {tab === "experience" && (
              <ProfileExperience experience={experience || []} canEdit={currentUser.id === id} />
            )}
            {tab === "skills" && <ProfileSkills skills={skills || []} canEdit={currentUser.id === id} />}
            {tab === "posts" && (
              <ProfilePosts
                posts={postsWithInteractions}
                user={profileUser}
                currentUserId={currentUser.id}
                isOwnProfile={currentUser.id === id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
