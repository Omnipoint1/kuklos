"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, VideoIcon, FileTextIcon, SendIcon, Play, X, Loader2 } from "lucide-react"

interface PostComposerProps {
  user: any
}

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
}

export function PostComposer({ user }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [postType, setPostType] = useState<"post" | "article" | "clip">("post")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = async (files: FileList | null, fileType: "image" | "video") => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      setUploadedFiles((prev) => [...prev, ...results])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerFileUpload = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handlePost = async () => {
    if ((!content.trim() && uploadedFiles.length === 0) || !user) return

    setIsPosting(true)
    try {
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: content.trim(),
        media_urls: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.url) : null,
      })

      if (error) throw error

      setContent("")
      setPostType("post")
      setUploadedFiles([])
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const getPlaceholder = () => {
    switch (postType) {
      case "article":
        return "Share an article or write about your thoughts..."
      case "clip":
        return "Add a caption for your clip..."
      default:
        return "What's on your mind?"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={`${user?.first_name} ${user?.last_name}`} />
            <AvatarFallback>
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {postType !== "post" && (
              <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  {postType === "clip" && <Play className="w-4 h-4" />}
                  {postType === "article" && <FileTextIcon className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {postType === "clip" ? "Creating Circle Clip" : "Writing Article"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPostType("post")}
                    className="ml-auto text-purple-600 hover:text-purple-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Textarea
              placeholder={getPlaceholder()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] border-none resize-none focus:ring-0 p-0 text-base"
              style={{ boxShadow: "none" }}
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.filename}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video src={file.url} className="w-full h-32 object-cover rounded-lg" controls />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const accept = fileInputRef.current?.accept || ""
                const fileType = accept.includes("image") ? "image" : "video"
                handleFileUpload(e.target.files, fileType)
                e.target.value = "" // Reset input
              }}
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600"
                  onClick={() => triggerFileUpload("image/*")}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600"
                  onClick={() => triggerFileUpload("video/*")}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <VideoIcon className="w-4 h-4 mr-2" />
                  )}
                  Video
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-600 hover:text-blue-600 ${postType === "article" ? "text-blue-600 bg-blue-50" : ""}`}
                  onClick={() => setPostType(postType === "article" ? "post" : "article")}
                >
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  Article
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-600 hover:text-purple-600 ${postType === "clip" ? "text-purple-600 bg-purple-50" : ""}`}
                  onClick={() => setPostType(postType === "clip" ? "post" : "clip")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Clip
                </Button>
              </div>

              <Button
                onClick={handlePost}
                disabled={(!content.trim() && uploadedFiles.length === 0) || isPosting || isUploading}
                size="sm"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
