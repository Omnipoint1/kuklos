"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Linkedin, Users, UserPlus, LinkIcon, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ShareDialogProps {
  postId: string
  postContent: string
  authorName: string
  isOpen: boolean
  onClose: () => void
}

export function ShareDialog({ postId, postContent, authorName, isOpen, onClose }: ShareDialogProps) {
  const [groups, setGroups] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchGroupsAndConnections()
    }
  }, [isOpen])

  const fetchGroupsAndConnections = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Fetch user's groups
    const { data: groupsData } = await supabase
      .from("group_members")
      .select(
        `
        group_id,
        groups (
          id,
          name,
          image_url,
          member_count
        )
      `,
      )
      .eq("user_id", user.id)

    if (groupsData) {
      setGroups(groupsData.map((gm: any) => gm.groups).filter(Boolean))
    }

    // Fetch user's connections
    const { data: connectionsData } = await supabase
      .from("connections")
      .select(
        `
        addressee_id,
        requester_id,
        users!connections_addressee_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `,
      )
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (connectionsData) {
      const connectionUsers = connectionsData
        .map((conn: any) => {
          // Get the other user in the connection
          return conn.requester_id === user.id ? conn.users : conn.users
        })
        .filter(Boolean)
      setConnections(connectionUsers)
    }
  }

  const handleShareToSocialMedia = (platform: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`
    const shareText = `Check out this post by ${authorName}: ${postContent.slice(0, 100)}...`

    let shareUrl = ""
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
        break
      case "tiktok":
        // TikTok doesn't have a direct web share API, copy link instead
        navigator.clipboard.writeText(postUrl)
        toast({
          title: "Link copied!",
          description: "Share this link on TikTok",
        })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(postUrl)
    toast({
      title: "Link copied!",
      description: "Post link copied to clipboard.",
    })
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleShare = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one group or person to share with.",
        variant: "destructive",
      })
      return
    }

    // Here you would implement the actual sharing logic
    // For now, we'll just show a success message
    toast({
      title: "Post shared!",
      description: `Shared with ${selectedItems.size} ${selectedItems.size === 1 ? "recipient" : "recipients"}.`,
    })
    setSelectedItems(new Set())
    onClose()
  }

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredConnections = connections.filter((user) =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>Share this post with your groups, connections, or on social media</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocialMedia("facebook")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="font-semibold">Facebook</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocialMedia("linkedin")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="font-semibold">LinkedIn</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocialMedia("tiktok")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TT</span>
                  </div>
                  <span className="font-semibold">TikTok</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4 bg-transparent" onClick={handleCopyLink}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span className="font-semibold">Copy Link</span>
                </div>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No groups found</p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => toggleSelection(group.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedItems.has(group.id)
                          ? "bg-purple-50 border-2 border-purple-500"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={group.image_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {group.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold">{group.name}</p>
                          <p className="text-sm text-gray-500">{group.member_count} members</p>
                        </div>
                      </div>
                      {selectedItems.has(group.id) && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            {selectedItems.size > 0 && (
              <Button onClick={handleShare} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                Share to {selectedItems.size} {selectedItems.size === 1 ? "group" : "groups"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No connections found</p>
                  </div>
                ) : (
                  filteredConnections.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleSelection(user.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedItems.has(user.id)
                          ? "bg-purple-50 border-2 border-purple-500"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                      </div>
                      {selectedItems.has(user.id) && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            {selectedItems.size > 0 && (
              <Button onClick={handleShare} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                Share to {selectedItems.size} {selectedItems.size === 1 ? "connection" : "connections"}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
