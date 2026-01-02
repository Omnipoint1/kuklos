"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Eye, PhoneOff, Loader2 } from "lucide-react"
import { LiveStreamPlayer } from "@/components/live/live-stream-player"

interface LiveStream {
  id: string
  user_id: string
  room_name: string
  title: string
  description: string | null
  is_live: boolean
  viewer_count: number
  started_at: string
  user?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

export default function LiveStreamPage() {
  const params = useParams()
  const router = useRouter()
  const roomName = params.roomName as string

  const [liveStream, setLiveStream] = useState<LiveStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveKitData, setLiveKitData] = useState<{
    token: string
    wsUrl: string
    isHost: boolean
  } | null>(null)

  useEffect(() => {
    const fetchLiveStream = async () => {
      try {
        const response = await fetch(`/api/live/stream/${roomName}`)
        if (response.ok) {
          const data = await response.json()
          setLiveStream(data)
        } else {
          setError("Live stream not found")
        }
      } catch (err) {
        setError("Failed to load live stream")
      } finally {
        setIsLoading(false)
      }
    }

    if (roomName) {
      fetchLiveStream()
    }
  }, [roomName])

  const handleJoinStream = async () => {
    setIsJoining(true)
    try {
      const response = await fetch("/api/live/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiveKitData({
          token: data.token,
          wsUrl: data.wsUrl,
          isHost: false,
        })
      } else {
        setError("Failed to join stream")
      }
    } catch (err) {
      setError("Failed to join stream")
    } finally {
      setIsJoining(false)
    }
  }

  const handleStartHosting = async () => {
    setIsJoining(true)
    try {
      const response = await fetch("/api/live/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiveKitData({
          token: data.token,
          wsUrl: data.wsUrl,
          isHost: true,
        })
      } else {
        setError("Failed to start hosting")
      }
    } catch (err) {
      setError("Failed to start hosting")
    } finally {
      setIsJoining(false)
    }
  }

  const handleEndStream = async () => {
    try {
      const response = await fetch("/api/live/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      })

      if (response.ok) {
        router.push("/feed")
      }
    } catch (err) {
      console.error("Failed to end stream:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !liveStream) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">{error || "Live stream not found"}</p>
            <Button onClick={() => router.push("/feed")}>Back to Feed</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        {liveKitData ? (
          <LiveStreamPlayer
            token={liveKitData.token}
            wsUrl={liveKitData.wsUrl}
            roomName={roomName}
            isHost={liveKitData.isHost}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg mb-4">Ready to join live stream</p>
              <Button onClick={handleJoinStream} disabled={isJoining} className="bg-blue-600 hover:bg-blue-700">
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                Join Stream
              </Button>
            </div>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-red-600 text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            LIVE
          </Badge>
        </div>

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{liveStream.viewer_count}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          {!liveKitData && (
            <Button onClick={handleStartHosting} disabled={isJoining} className="bg-red-600 hover:bg-red-700">
              {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Broadcasting"}
            </Button>
          )}
          <Button onClick={handleEndStream} variant="destructive">
            <PhoneOff className="w-4 h-4 mr-2" />
            End Stream
          </Button>
        </div>
      </div>

      {/* Stream Info */}
      <div className="bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={liveStream.user?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {liveStream.user?.first_name?.[0]}
                {liveStream.user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{liveStream.title}</h1>
              <p className="text-gray-600 mb-2">
                {liveStream.user?.first_name} {liveStream.user?.last_name}
              </p>
              {liveStream.description && <p className="text-gray-700">{liveStream.description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
