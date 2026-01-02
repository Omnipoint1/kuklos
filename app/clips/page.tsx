"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Share, MoreVertical, Play, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

interface Clip {
  id: string
  title?: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration: number
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  user_has_liked: boolean
  created_at: string
  author: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    is_verified: boolean
  }
}

export default function ClipsPage() {
  const [currentClip, setCurrentClip] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const fetchClips = async () => {
    try {
      const response = await fetch("/api/clips")
      if (response.ok) {
        const data = await response.json()
        setClips(data.clips || [])
      }
    } catch (error) {
      console.error("Failed to fetch clips:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClips()
  }, [])

  const handleLike = async (clipId: string, isLiked: boolean) => {
    try {
      const method = isLiked ? "DELETE" : "POST"
      const response = await fetch(`/api/clips/${clipId}/like`, { method })

      if (response.ok) {
        // Update local state
        setClips(
          clips.map((clip) =>
            clip.id === clipId
              ? {
                  ...clip,
                  user_has_liked: !isLiked,
                  likes_count: isLiked ? clip.likes_count - 1 : clip.likes_count + 1,
                }
              : clip,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to like/unlike clip:", error)
    }
  }

  const togglePlayPause = () => {
    const video = videoRefs.current[currentClip]
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    const video = videoRefs.current[currentClip]
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleScroll = (direction: "up" | "down") => {
    if (direction === "down" && currentClip < clips.length - 1) {
      setCurrentClip(currentClip + 1)
    } else if (direction === "up" && currentClip > 0) {
      setCurrentClip(currentClip - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        handleScroll("up")
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        handleScroll("down")
      } else if (e.key === " ") {
        e.preventDefault()
        togglePlayPause()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentClip, isPlaying])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading clips...</div>
      </div>
    )
  }

  if (clips.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-semibold mb-2">No clips available</h2>
          <p className="text-gray-400 mb-4">Be the first to share a clip!</p>
          <Button asChild>
            <Link href="/feed">Back to Feed</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-white font-semibold text-lg">Circle Clips</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Feed */}
      <div className="pt-16">
        {clips.map((clip, index) => (
          <div key={clip.id} className={`relative h-screen w-full ${index === currentClip ? "block" : "hidden"}`}>
            {/* Video */}
            <div className="relative h-full w-full flex items-center justify-center bg-gray-900">
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="h-full w-auto max-w-full object-cover"
                poster={clip.thumbnail_url || "/placeholder.svg"}
                loop
                autoPlay={index === currentClip}
                muted={isMuted}
                playsInline
                onClick={togglePlayPause}
              >
                <source src={clip.video_url} type="video/mp4" />
              </video>

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white bg-black/50 hover:bg-black/70 rounded-full p-4"
                    onClick={togglePlayPause}
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              )}
            </div>

            {/* User Info & Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-end justify-between">
                {/* User Info */}
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-10 h-10 border-2 border-white">
                      <AvatarImage
                        src={clip.author.avatar_url || "/placeholder.svg"}
                        alt={`${clip.author.first_name} ${clip.author.last_name}`}
                      />
                      <AvatarFallback>
                        {clip.author.first_name[0]}
                        {clip.author.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold">
                        {clip.author.first_name} {clip.author.last_name}
                      </p>
                      <p className="text-gray-300 text-sm">
                        @{clip.author.first_name.toLowerCase()}
                        {clip.author.last_name.toLowerCase()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-black bg-transparent"
                    >
                      Follow
                    </Button>
                  </div>
                  {clip.description && <p className="text-white text-sm mb-2">{clip.description}</p>}
                  <p className="text-gray-300 text-xs">{new Date(clip.created_at).toLocaleDateString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-white hover:bg-white/10 flex flex-col items-center gap-1 ${
                      clip.user_has_liked ? "text-red-500" : ""
                    }`}
                    onClick={() => handleLike(clip.id, clip.user_has_liked)}
                  >
                    <Heart className={`w-6 h-6 ${clip.user_has_liked ? "fill-current" : ""}`} />
                    <span className="text-xs">{clip.likes_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs">{clip.comments_count}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 flex flex-col items-center gap-1"
                  >
                    <Share className="w-6 h-6" />
                    <span className="text-xs">{clip.shares_count}</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Hints */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex flex-col gap-2">
                {currentClip > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => handleScroll("up")}
                  >
                    ↑
                  </Button>
                )}
                {currentClip < clips.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => handleScroll("down")}
                  >
                    ↓
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        {clips.map((_, index) => (
          <div key={index} className={`w-1 h-8 rounded-full ${index === currentClip ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
    </div>
  )
}
