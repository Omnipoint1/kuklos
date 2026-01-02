import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedHeader } from "@/components/feed/feed-header"
import { MessagesSidebar } from "@/components/messages/messages-sidebar"
import { ChatWindow } from "@/components/messages/chat-window"

interface MessagesPageProps {
  searchParams: Promise<{ user?: string; thread?: string }>
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { user: selectedUserId, thread: selectedThreadId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get message threads for the current user
  const { data: threads } = await supabase
    .from("message_threads")
    .select(`
      *,
      user_a:users!message_threads_user_a_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url,
        headline
      ),
      user_b:users!message_threads_user_b_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url,
        headline
      )
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  // Process threads to get the other user
  const processedThreads =
    threads?.map((thread) => ({
      ...thread,
      otherUser: thread.user_a_id === user.id ? thread.user_b : thread.user_a,
    })) || []

  // If a specific user is selected but no thread exists, create one
  let activeThread = null
  if (selectedUserId) {
    // Check if thread exists
    const existingThread = processedThreads.find((t) => t.otherUser.id === selectedUserId)
    if (existingThread) {
      activeThread = existingThread
    } else {
      // Create new thread
      const { data: newThread } = await supabase
        .from("message_threads")
        .insert({
          user_a_id: user.id < selectedUserId ? user.id : selectedUserId,
          user_b_id: user.id < selectedUserId ? selectedUserId : user.id,
        })
        .select(`
          *,
          user_a:users!message_threads_user_a_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            headline
          ),
          user_b:users!message_threads_user_b_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            headline
          )
        `)
        .single()

      if (newThread) {
        activeThread = {
          ...newThread,
          otherUser: newThread.user_a_id === user.id ? newThread.user_b : newThread.user_a,
        }
      }
    }
  } else if (selectedThreadId) {
    activeThread = processedThreads.find((t) => t.id === selectedThreadId)
  } else if (processedThreads.length > 0) {
    activeThread = processedThreads[0]
  }

  // Get messages for active thread
  let messages = []
  if (activeThread) {
    const { data: threadMessages } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("thread_id", activeThread.id)
      .order("created_at", { ascending: true })

    messages = threadMessages || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FeedHeader user={userProfile} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          <div className="flex h-full">
            {/* Messages sidebar */}
            <div className="w-1/3 border-r border-gray-200">
              <MessagesSidebar threads={processedThreads} activeThreadId={activeThread?.id} currentUserId={user.id} />
            </div>

            {/* Chat window */}
            <div className="flex-1">
              {activeThread ? (
                <ChatWindow thread={activeThread} messages={messages} currentUserId={user.id} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose from your existing conversations or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
