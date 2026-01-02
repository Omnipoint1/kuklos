export async function createNotification(userId: string, type: string, title: string, message: string, data?: any) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        message,
        data,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create notification")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export const NotificationTypes = {
  CONNECTION_REQUEST: "connection_request",
  CONNECTION_ACCEPTED: "connection_accepted",
  MESSAGE: "message",
  POST_LIKE: "post_like",
  POST_COMMENT: "post_comment",
} as const
