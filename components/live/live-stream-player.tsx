"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import type { Room } from "livekit-client"
import { Button } from "@/components/ui/button"
import { AlertCircle, Video, Mic } from "lucide-react"

interface LiveStreamPlayerProps {
  token: string
  wsUrl: string
  roomName: string
  isHost?: boolean
}

export function LiveStreamPlayer({ token, wsUrl, roomName, isHost = false }: LiveStreamPlayerProps) {
  const [room, setRoom] = useState<Room>()
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  const requestPermissions = async () => {
    if (!isHost) {
      setPermissionsGranted(true)
      return
    }

    try {
      console.log("[v0] Requesting camera and microphone permissions...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Stop the test stream immediately
      stream.getTracks().forEach((track) => track.stop())

      console.log("[v0] Permissions granted")
      setPermissionsGranted(true)
      setPermissionError(null)
    } catch (error: any) {
      console.error("[v0] Permission error:", error)
      if (error.name === "NotAllowedError") {
        setPermissionError("Camera and microphone access denied. Please allow access to start broadcasting.")
      } else if (error.name === "NotFoundError") {
        setPermissionError("No camera or microphone found. Please connect devices to broadcast.")
      } else {
        setPermissionError("Failed to access camera and microphone. Please check your device settings.")
      }
    }
  }

  useEffect(() => {
    requestPermissions()
  }, [isHost])

  if (isHost && !permissionsGranted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md px-6">
          {permissionError ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Permission Required</h3>
              <p className="text-gray-300 mb-4">{permissionError}</p>
              <Button onClick={requestPermissions} className="bg-blue-600 hover:bg-blue-700">
                <Video className="w-4 h-4 mr-2" />
                Grant Permissions
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-4 justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Requesting Permissions</h3>
              <p className="text-gray-300">Please allow camera and microphone access to start broadcasting...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <LiveKitRoom
        video={isHost}
        audio={isHost}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
        style={{ height: "100%" }}
        onConnected={(room) => {
          console.log("[v0] Connected to LiveKit room:", room.name)
          setRoom(room)
        }}
        onDisconnected={() => {
          console.log("[v0] Disconnected from LiveKit room")
        }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
