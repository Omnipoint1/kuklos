"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MessageThread {
  id: string
  last_message_at?: string
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    headline?: string
  }
}

interface MessagesSidebarProps {
  threads: MessageThread[]
  activeThreadId?: string
  currentUserId: string
}

export function MessagesSidebar({ threads, activeThreadId, currentUserId }: MessagesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredThreads = threads.filter((thread) => {
    const user = thread.otherUser
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search)
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Link href="/network?tab=connections">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredThreads.map((thread) => {
              const user = thread.otherUser
              const isActive = thread.id === activeThreadId

              return (
                <Link key={thread.id} href={`/messages?thread=${thread.id}`}>
                  <div
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={`${user.first_name} ${user.last_name}`}
                        />
                        <AvatarFallback>
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </h3>
                          {thread.last_message_at && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {user.headline && <p className="text-sm text-gray-600 truncate">{user.headline}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            {searchTerm ? (
              <div>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div>
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">Start messaging your connections to build relationships</p>
                <Link href="/network?tab=connections">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
