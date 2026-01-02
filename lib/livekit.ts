import { AccessToken } from "livekit-server-sdk"

export function generateLiveKitToken(roomName: string, participantName: string, isHost = false) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API credentials not configured")
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  })

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
  })

  return token.toJwt()
}
