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
      console.log("[v0] Creating post with content:", content)
      console.log("[v0] User ID:", user.id)
      console.log("[v0] Media files:", uploadedFiles)

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          content: content.trim(),
          media_urls: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.url) : null,
        })
        .select()

      if (error) {
        console.error("[v0] Post creation error:", error)
        throw error
      }

      console.log("[v0] Post created successfully:", data)

      setContent("")
      setPostType("post")
      setUploadedFiles([])

      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating post:", error)
      alert("Failed to create post. Please try again.")
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
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-purple-200">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={`${user?.first_name} ${user?.last_name}`} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {postType !== "post" && (
              <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  {postType === "clip" && <Play className="w-5 h-5" />}
                  {postType === "article" && <FileTextIcon className="w-5 h-5" />}
                  <span className="text-sm font-semibold">
                    {postType === "clip" ? "Creating Circle Clip" : "Writing Article"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPostType("post")}
                    className="ml-auto text-purple-600 hover:text-purple-800 hover:bg-purple-100"
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
              className="min-h-[100px] border-2 border-gray-100 focus:border-purple-300 resize-none text-base rounded-xl"
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.filename}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <video src={file.url} className="w-full h-40 object-cover" controls />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
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
                e.target.value = ""
              }}
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  onClick={() => triggerFileUpload("image/*")}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  onClick={() => triggerFileUpload("video/*")}
                  disabled={isUploading}
                >
                  <VideoIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg ${postType === "article" ? "text-green-600 bg-green-50" : ""}`}
                  onClick={() => setPostType(postType === "article" ? "post" : "article")}
                >
                  <FileTextIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg ${postType === "clip" ? "text-pink-600 bg-pink-50" : ""}`}
                  onClick={() => setPostType(postType === "clip" ? "post" : "clip")}
                >
                  <Play className="w-5 h-5" />
                </Button>
              </div>

              <Button
                onClick={handlePost}
                disabled={(!content.trim() && uploadedFiles.length === 0) || isPosting || isUploading}
                className="gradient-purple text-white font-semibold rounded-full px-6 hover:opacity-90 shadow-lg"
              >
                {isPosting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SendIcon className="w-4 h-4 mr-2" />}
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
