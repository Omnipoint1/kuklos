import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { ProfileAbout } from "@/components/profile/profile-about"
import { ProfileExperience } from "@/components/profile/profile-experience"
import { ProfileSkills } from "@/components/profile/profile-skills"

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
          </div>
        </div>
      </div>
    </div>
  )
}
