"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Trash2, Edit, Bookmark, Flag, LinkIcon } from "lucide-react"
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", currentUserId)

      if (error) throw error

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full h-8 w-8 p-0">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isOwner ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/post/${postId}/edit`)
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Post saved",
                    description: "Post has been saved to your collection.",
                  })
                }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Report submitted",
                    description: "Thank you for helping keep Circle safe.",
                  })
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleCopyLink}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
