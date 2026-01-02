"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, MapPin, Search, Users } from "lucide-react"

interface Connection {
  id: string
  connectedUser: {
    id: string
    first_name: string
    last_name: string
    headline?: string
    avatar_url?: string
    location?: string
    is_verified?: boolean
  }
}

interface ConnectionsListProps {
  connections: Connection[]
  currentUserId: string
}

export function ConnectionsList({ connections, currentUserId }: ConnectionsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConnections = connections.filter((connection) => {
    const user = connection.connectedUser
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const headline = user.headline?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()

    return fullName.includes(search) || headline.includes(search)
  })

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
        <p className="text-gray-600 mb-4">
          Start building your professional network by connecting with colleagues and industry professionals.
        </p>
        <Link href="/network?tab=discover">
          <Button>Discover People</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Connections</h3>
            <p className="text-gray-600">{connections.length} professional connections</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Connections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnections.map((connection) => {
          const user = connection.connectedUser
          return (
            <Card key={connection.id}>
              <CardContent className="p-6">
                <div className="text-center">
                  <Link href={`/profile/${user.id}`}>
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      <AvatarFallback className="text-lg">
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="mb-4">
                    <Link href={`/profile/${user.id}`} className="block">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {user.first_name} {user.last_name}
                        </h3>
                        {user.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {user.headline && <p className="text-sm text-gray-600 mb-2">{user.headline}</p>}

                    {user.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {user.location}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/messages?user=${user.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredConnections.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No connections found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
