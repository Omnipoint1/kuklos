"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PostOptionsMenuProps {
  postId: string
  authorId: string
  currentUserId: string
  onDelete?: () => void
}

export function PostOptionsMenu({ postId, authorId, currentUserId, onDelete }: PostOptionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isOwner = authorId === currentUserId

  console.log("[v0] PostOptionsMenu - isOwner:", isOwner, "authorId:", authorId, "currentUserId:", currentUserId)

  const handleDelete = async () => {
    console.log("[v0] Starting delete for post:", postId)
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", currentUserId)

      if (error) {
        console.error("[v0] Delete error:", error)
        throw error
      }

      console.log("[v0] Post deleted successfully")
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      })

      setShowDeleteDialog(false)
      onDelete?.()
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(postUrl)
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard.",
    })
  }

  if (!isOwner) {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("[v0] Delete button clicked")
          setShowDeleteDialog(true)
        }}
        className="hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8 p-0 transition-colors"
        title="Delete post"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
