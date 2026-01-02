import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Users, UserPlus, Heart, Play, DollarSign } from "lucide-react"

interface FeedSidebarProps {
  user: any
}

export function FeedSidebar({ user }: FeedSidebarProps) {
  return (
    <div className="space-y-4">
      {/* User profile card */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-3">
              <AvatarImage
                src={user?.avatar_url || "/placeholder.svg"}
                alt={`${user?.first_name} ${user?.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <Link href={`/profile/${user?.id}`} className="block">
              <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                {user?.first_name} {user?.last_name}
              </h3>
            </Link>
            {user?.headline && <p className="text-sm text-gray-600 mt-1">{user.headline}</p>}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Profile views</span>
              <span className="font-semibold text-blue-600">12</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Connections</span>
              <span className="font-semibold text-blue-600">45</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/network" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <Users className="w-4 h-4" />
              Find connections
            </Link>
            <Link href="/groups" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <UserPlus className="w-4 h-4" />
              Browse groups
            </Link>
            <Link href="/eros" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600">
              <Heart className="w-4 h-4" />
              Eros
            </Link>
            <Link href="/clips" className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600">
              <Play className="w-4 h-4" />
              Circle Clips
            </Link>
            <Link href="/funding" className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600">
              <DollarSign className="w-4 h-4" />
              Circle Funding
            </Link>
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            >
              <Eye className="w-4 h-4" />
              View profile
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
