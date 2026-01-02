"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Users, MessageCircle, Bell, Search, LogOut } from "lucide-react"

interface FeedHeaderProps {
  user: any
}

export function FeedHeader({ user }: FeedHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/feed" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Circle</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/feed" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link href="/network" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Users className="w-5 h-5" />
              <span>Circle</span>
            </Link>
            <Link href="/messages" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Bell className="w-5 h-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar_url || "/placeholder.svg"}
                    alt={`${user?.first_name} ${user?.last_name}`}
                  />
                  <AvatarFallback>
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user?.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
