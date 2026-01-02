"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Users, MessageCircle, Bell, Search, LogOut, Menu } from "lucide-react"

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/feed" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                Circle
              </h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Circle..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/feed">
              <Button variant="ghost" size="icon" className="relative hover:bg-purple-50 rounded-xl">
                <Home className="w-5 h-5 text-gray-700 hover:text-purple-600" />
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
              </Button>
            </Link>
            <Link href="/network">
              <Button variant="ghost" size="icon" className="hover:bg-purple-50 rounded-xl">
                <Users className="w-5 h-5 text-gray-700 hover:text-purple-600" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="hover:bg-purple-50 rounded-xl relative">
                <MessageCircle className="w-5 h-5 text-gray-700 hover:text-purple-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="hover:bg-purple-50 rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-700 hover:text-purple-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative p-0 rounded-full ring-2 ring-transparent hover:ring-purple-300 transition-all"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-purple-200">
                    <AvatarImage
                      src={user?.avatar_url || "/placeholder.svg"}
                      alt={`${user?.first_name} ${user?.last_name}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
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
      </div>
    </header>
  )
}
