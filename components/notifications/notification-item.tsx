"use client"

import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle, Heart, MessageSquare, Users } from "lucide-react"
import Link from "next/link"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    data: any
    read: boolean
    created_at: string
  }
  onMarkAsRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "connection_request":
        return <UserPlus className="h-5 w-5 text-blue-600" />
      case "connection_accepted":
        return <Users className="h-5 w-5 text-green-600" />
      case "message":
        return <MessageCircle className="h-5 w-5 text-purple-600" />
      case "post_like":
        return <Heart className="h-5 w-5 text-red-600" />
      case "post_comment":
        return <MessageSquare className="h-5 w-5 text-orange-600" />
      default:
        return <MessageCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getActionLink = () => {
    switch (notification.type) {
      case "connection_request":
        return "/network"
      case "connection_accepted":
        return `/profile/${notification.data.userId}`
      case "message":
        return "/messages"
      case "post_like":
      case "post_comment":
        return `/feed`
      default:
        return "#"
    }
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {notification.data.avatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.data.avatar || "/placeholder.svg"} />
              <AvatarFallback>{notification.data.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="p-2 bg-gray-100 rounded-full">{getIcon()}</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>

            {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0" />}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" asChild onClick={handleClick}>
              <Link href={getActionLink()}>View</Link>
            </Button>
            {!notification.read && (
              <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(notification.id)}>
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
