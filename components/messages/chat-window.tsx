"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface MessageThread {
  id: string
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    headline?: string
  }
}

interface ChatWindowProps {
  thread: MessageThread
  messages: Message[]
  currentUserId: string
}

export function ChatWindow({ thread, messages, currentUserId }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        thread_id: thread.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })

      if (error) throw error

      // Update thread's last message time
      await supabase.from("message_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread.id)

      setNewMessage("")
      router.refresh()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const otherUser = thread.otherUser

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={otherUser.avatar_url || "/placeholder.svg"}
                alt={`${otherUser.first_name} ${otherUser.last_name}`}
              />
              <AvatarFallback>
                {otherUser.first_name[0]}
                {otherUser.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser.first_name} {otherUser.last_name}
              </h3>
              {otherUser.headline && <p className="text-sm text-gray-600">{otherUser.headline}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUserId
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
            const showTimestamp = index === messages.length - 1 || messages[index + 1].sender_id !== message.sender_id

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                  {showAvatar && !isCurrentUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={message.sender.avatar_url || "/placeholder.svg"}
                        alt={`${message.sender.first_name} ${message.sender.last_name}`}
                      />
                      <AvatarFallback className="text-xs">
                        {message.sender.first_name[0]}
                        {message.sender.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!showAvatar && !isCurrentUser && <div className="w-8" />}

                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isCurrentUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {showTimestamp && (
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-600">Send a message to {otherUser.first_name} to get started</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Textarea
            placeholder={`Message ${otherUser.first_name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
