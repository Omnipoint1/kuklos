"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { Sparkles, ThumbsUp, Reply } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  likes_count: number
  author: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    is_verified?: boolean
  }
}

interface CommentsSectionProps {
  postId: string
  currentUserId: string
  isOpen: boolean
  onClose: () => void
}

export function CommentsSection({ postId, currentUserId, isOpen, onClose }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const supabase = createClient()

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAiSuggestions = async () => {
    if (isGeneratingAi) return

    setIsGeneratingAi(true)
    try {
      const response = await fetch("/api/ai/comment-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          existingComments: comments.slice(0, 3).map((c) => c.content), // Send first 3 comments for context
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
        setShowAiSuggestions(true)
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments((prev) => [...prev, data.comment])
        setNewComment("")
        setShowAiSuggestions(false)
        setAiSuggestions([])
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const applySuggestion = (suggestion: string) => {
    setNewComment(suggestion)
    setShowAiSuggestions(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, postId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex flex-col h-[60vh]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {comment.author.first_name[0]}
                      {comment.author.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author.first_name} {comment.author.last_name}
                        </span>
                        {comment.author.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator />

          {/* AI Suggestions */}
          {showAiSuggestions && aiSuggestions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-2 w-full justify-start text-wrap bg-transparent"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                />

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAiSuggestions}
                    disabled={isGeneratingAi}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {isGeneratingAi ? "Generating..." : "AI Assist"}
                  </Button>

                  <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
