import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedHeader } from "@/components/feed/feed-header"
import { NetworkTabs } from "@/components/network/network-tabs"
import { ConnectionsList } from "@/components/network/connections-list"
import { PeopleYouMayKnow } from "@/components/network/people-you-may-know"
import { PendingRequests } from "@/components/network/pending-requests"

interface NetworkPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const { tab = "connections" } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get connections
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      requester:users!connections_requester_id_fkey(
        id,
        first_name,
        last_name,
        headline,
        avatar_url,
        location,
        is_verified
      ),
      addressee:users!connections_addressee_id_fkey(
        id,
        first_name,
        last_name,
        headline,
        avatar_url,
        location,
        is_verified
      )
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted")

  // Get pending requests (received)
  const { data: pendingRequests } = await supabase
    .from("connections")
    .select(`
      *,
      requester:users!connections_requester_id_fkey(
        id,
        first_name,
        last_name,
        headline,
        avatar_url,
        location,
        is_verified
      )
    `)
    .eq("addressee_id", user.id)
    .eq("status", "pending")

  // Get sent requests
  const { data: sentRequests } = await supabase
    .from("connections")
    .select(`
      *,
      addressee:users!connections_addressee_id_fkey(
        id,
        first_name,
        last_name,
        headline,
        avatar_url,
        location,
        is_verified
      )
    `)
    .eq("requester_id", user.id)
    .eq("status", "pending")

  // Get people you may know (users not connected to)
  const connectedUserIds =
    connections?.flatMap((conn) => [conn.requester_id === user.id ? conn.addressee_id : conn.requester_id]) || []

  const allRequestUserIds = [
    ...(pendingRequests?.map((req) => req.requester_id) || []),
    ...(sentRequests?.map((req) => req.addressee_id) || []),
  ]

  const excludedIds = [user.id, ...connectedUserIds, ...allRequestUserIds]

  const { data: suggestedPeople } = await supabase
    .from("users")
    .select("id, first_name, last_name, headline, avatar_url, location, is_verified")
    .not("id", "in", `(${excludedIds.join(",")})`)
    .limit(10)

  // Process connections to get the other user
  const processedConnections =
    connections?.map((conn) => ({
      ...conn,
      connectedUser: conn.requester_id === user.id ? conn.addressee : conn.requester,
    })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <FeedHeader user={userProfile} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Circle</h1>
          <p className="text-gray-600">Manage your connections</p>
        </div>

        <NetworkTabs activeTab={tab} />

        <div className="mt-6">
          {tab === "connections" && <ConnectionsList connections={processedConnections} currentUserId={user.id} />}
          {tab === "requests" && (
            <PendingRequests
              pendingRequests={pendingRequests || []}
              sentRequests={sentRequests || []}
              currentUserId={user.id}
            />
          )}
          {tab === "discover" && <PeopleYouMayKnow people={suggestedPeople || []} currentUserId={user.id} />}
        </div>
      </div>
    </div>
  )
}
