"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Globe, Edit, MessageCircle, UserPlus, UserCheck, UserX, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GoLiveDialog } from "@/components/live/go-live-dialog"

interface ProfileHeaderProps {
  user: {
    id: string
    first_name: string
    last_name: string
    headline?: string
    bio?: string
    location?: string
    website?: string
    avatar_url?: string
    banner_url?: string
    is_verified?: boolean
  }
  currentUserId: string
  connectionStatus?: {
    status: string
    isRequester: boolean
  } | null
}

export function ProfileHeader({ user, currentUserId, connectionStatus }: ProfileHeaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState(connectionStatus)
  const [connectionMessage, setConnectionMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const isOwnProfile = user.id === currentUserId

  const handleConnectionAction = async (action: "request" | "accept" | "decline" | "cancel") => {
    setIsLoading(true)
    try {
      if (action === "request") {
        const { error } = await supabase.from("connections").insert({
          requester_id: currentUserId,
          addressee_id: user.id,
          status: "pending",
          message: connectionMessage.trim() || null,
        })
        if (!error) {
          setCurrentConnectionStatus({ status: "pending", isRequester: true })
          setConnectionMessage("")
        }
      } else if (action === "accept") {
        const { error } = await supabase
          .from("connections")
          .update({ status: "accepted" })
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        if (!error) {
          setCurrentConnectionStatus({ status: "accepted", isRequester: false })
        }
      } else if (action === "decline" || action === "cancel") {
        const { error } = await supabase
          .from("connections")
          .delete()
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        if (!error) {
          setCurrentConnectionStatus(null)
        }
      }
    } catch (error) {
      console.error("Connection action error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionButton = () => {
    if (!currentConnectionStatus) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Connect with {user.first_name} {user.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Personal message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hi, I'd like to connect with you on Circle..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleConnectionAction("request")} disabled={isLoading} className="flex-1">
                  {isLoading ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    const { status, isRequester } = currentConnectionStatus

    if (status === "pending") {
      if (isRequester) {
        return (
          <Button variant="outline" onClick={() => handleConnectionAction("cancel")} disabled={isLoading}>
            <Clock className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        )
      } else {
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleConnectionAction("accept")} disabled={isLoading}>
              <UserCheck className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" onClick={() => handleConnectionAction("decline")} disabled={isLoading}>
              <UserX className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )
      }
    }

    if (status === "accepted") {
      return (
        <Button variant="outline">
          <UserCheck className="w-4 h-4 mr-2" />
          Connected
        </Button>
      )
    }

    return null
  }

  return (
    <div className="bg-white shadow-sm">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        {user.banner_url && (
          <img
            src={user.banner_url || "/placeholder.svg"}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-0">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="text-2xl">
                {user.first_name[0]}
                {user.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end">
            {isOwnProfile ? (
              <div className="flex gap-2">
                <GoLiveDialog userId={user.id} />
                <Button variant="outline" onClick={() => router.push("/settings/profile")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {getConnectionButton()}
                <Link href={`/messages?user=${user.id}`}>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="pt-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              {user.is_verified && <Badge variant="secondary">Verified</Badge>}
            </div>

            {user.headline && <p className="text-lg text-gray-700 mb-2">{user.headline}</p>}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            {user.bio && <p className="text-gray-700 max-w-2xl">{user.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
