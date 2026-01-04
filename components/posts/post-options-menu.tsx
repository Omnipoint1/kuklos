"use client"

import type React from "react"

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

  console.log("[v0] PostOptionsMenu rendered - postId:", postId, "isOwner:", isOwner)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Delete button clicked for post:", postId)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    console.log("[v0] Confirming delete for post:", postId)
    setIsDeleting(true)

    try {
      console.log("[v0] Attempting to delete from database...")
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", currentUserId)

      if (error) {
        console.error("[v0] Database delete error:", error)
        throw error
      }

      console.log("[v0] Post deleted successfully from database")

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      })

      setShowDeleteDialog(false)

      // Call onDelete callback if provided
      if (onDelete) {
        console.log("[v0] Calling onDelete callback")
        onDelete()
      }

      // Refresh the page to update the UI
      console.log("[v0] Refreshing router")
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

  if (!isOwner) {
    console.log("[v0] Not showing delete button - user is not owner")
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteClick}
        className="hover:bg-red-50 hover:text-red-600 rounded-full h-9 w-9 p-0 transition-colors"
        title="Delete post"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                console.log("[v0] Delete cancelled")
                setShowDeleteDialog(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
