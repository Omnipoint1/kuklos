import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Users, UserPlus, Heart, Play, DollarSign, TrendingUp, Zap } from "lucide-react"

interface FeedSidebarProps {
  user: any
}

export function FeedSidebar({ user }: FeedSidebarProps) {
  return (
    <div className="space-y-4 sticky top-20">
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="h-16 gradient-purple" />
        <CardContent className="p-4 -mt-8">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-white shadow-lg">
              <AvatarImage
                src={user?.avatar_url || "/placeholder.svg"}
                alt={`${user?.first_name} ${user?.last_name}`}
              />
              <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <Link href={`/profile/${user?.id}`} className="block">
              <h3 className="font-bold text-gray-900 hover:text-purple-600 text-lg">
                {user?.first_name} {user?.last_name}
              </h3>
            </Link>
            {user?.headline && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.headline}</p>}
          </div>

          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-center gap-1">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-600 text-lg">12</span>
              </div>
              <span className="text-xs text-gray-600">Profile views</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-pink-600" />
                <span className="font-bold text-pink-600 text-lg">45</span>
              </div>
              <span className="text-xs text-gray-600">Connections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-1">
            <Link
              href="/network"
              className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-purple-600">Find connections</span>
            </Link>
            <Link
              href="/groups"
              className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-600">Browse groups</span>
            </Link>
            <Link
              href="/eros"
              className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-rose-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-rose-600">Eros Dating</span>
            </Link>
            <Link
              href="/clips"
              className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-purple-600">Circle Clips</span>
            </Link>
            <Link
              href="/funding"
              className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-green-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-green-600">Circle Funding</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Trending Now
            </span>
          </h3>
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-900">#AIRevolution</p>
              <p className="text-xs text-gray-600">2.4k posts</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">#RemoteWork</p>
              <p className="text-xs text-gray-600">1.8k posts</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">#TechInnovation</p>
              <p className="text-xs text-gray-600">1.2k posts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
