"use client"

import { useState } from "react"
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import type { Room } from "livekit-client"

interface LiveStreamPlayerProps {
  token: string
  wsUrl: string
  roomName: string
  isHost?: boolean
}

export function LiveStreamPlayer({ token, wsUrl, roomName, isHost = false }: LiveStreamPlayerProps) {
  const [room, setRoom] = useState<Room>()

  return (
    <div className="w-full h-full">
      <LiveKitRoom
        video={isHost}
        audio={isHost}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
        style={{ height: "100%" }}
        onConnected={(room) => setRoom(room)}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
