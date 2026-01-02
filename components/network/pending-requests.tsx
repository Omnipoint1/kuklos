"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX, Clock, Send } from "lucide-react"

interface PendingRequest {
  id: string
  message?: string
  created_at: string
  requester: {
    id: string
    first_name: string
    last_name: string
    headline?: string
    avatar_url?: string
    location?: string
    is_verified?: boolean
  }
}

interface SentRequest {
  id: string
  message?: string
  created_at: string
  addressee: {
    id: string
    first_name: string
    last_name: string
    headline?: string
    avatar_url?: string
    location?: string
    is_verified?: boolean
  }
}

interface PendingRequestsProps {
  pendingRequests: PendingRequest[]
  sentRequests: SentRequest[]
  currentUserId: string
}

export function PendingRequests({ pendingRequests, sentRequests, currentUserId }: PendingRequestsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClient()

  const handleConnectionAction = async (connectionId: string, action: "accept" | "decline" | "cancel") => {
    setLoadingStates((prev) => ({ ...prev, [connectionId]: true }))

    try {
      if (action === "accept") {
        const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId)

        if (error) throw error
      } else if (action === "decline" || action === "cancel") {
        const { error } = await supabase.from("connections").delete().eq("id", connectionId)

        if (error) throw error
      }

      router.refresh()
    } catch (error) {
      console.error("Error handling connection:", error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [connectionId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Received Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Received Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const user = request.requester
                const isLoading = loadingStates[request.id]

                return (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${user.id}`}>
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
                      </Link>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${user.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {user.first_name} {user.last_name}
                          </Link>
                          {user.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {user.headline && <p className="text-sm text-gray-600">{user.headline}</p>}
                        {request.message && <p className="text-sm text-gray-700 mt-1 italic">"{request.message}"</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConnectionAction(request.id, "accept")}
                        disabled={isLoading}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectionAction(request.id, "decline")}
                        disabled={isLoading}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending connection requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Sent Requests ({sentRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentRequests.length > 0 ? (
            <div className="space-y-4">
              {sentRequests.map((request) => {
                const user = request.addressee
                const isLoading = loadingStates[request.id]

                return (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${user.id}`}>
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
                      </Link>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${user.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {user.first_name} {user.last_name}
                          </Link>
                          {user.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {user.headline && <p className="text-sm text-gray-600">{user.headline}</p>}
                        {request.message && (
                          <p className="text-sm text-gray-700 mt-1 italic">Your message: "{request.message}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectionAction(request.id, "cancel")}
                        disabled={isLoading}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sent connection requests</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
