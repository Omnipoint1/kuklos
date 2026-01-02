"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserPlus, MapPin, Users } from "lucide-react"

interface Person {
  id: string
  first_name: string
  last_name: string
  headline?: string
  avatar_url?: string
  location?: string
  is_verified?: boolean
}

interface PeopleYouMayKnowProps {
  people: Person[]
  currentUserId: string
}

export function PeopleYouMayKnow({ people, currentUserId }: PeopleYouMayKnowProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [connectionMessage, setConnectionMessage] = useState("")
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleConnect = async (personId: string, message?: string) => {
    setLoadingStates((prev) => ({ ...prev, [personId]: true }))

    try {
      const { error } = await supabase.from("connections").insert({
        requester_id: currentUserId,
        addressee_id: personId,
        status: "pending",
        message: message?.trim() || null,
      })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error sending connection request:", error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [personId]: false }))
      setConnectionMessage("")
      setSelectedPerson(null)
    }
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
        <p className="text-gray-600">Check back later for new connection suggestions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">People You May Know</h3>
            <p className="text-gray-600">Expand your professional network</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => {
          const isLoading = loadingStates[person.id]

          return (
            <Card key={person.id}>
              <CardContent className="p-6">
                <div className="text-center">
                  <Link href={`/profile/${person.id}`}>
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage
                        src={person.avatar_url || "/placeholder.svg"}
                        alt={`${person.first_name} ${person.last_name}`}
                      />
                      <AvatarFallback className="text-lg">
                        {person.first_name[0]}
                        {person.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="mb-4">
                    <Link href={`/profile/${person.id}`} className="block">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {person.first_name} {person.last_name}
                        </h3>
                        {person.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {person.headline && <p className="text-sm text-gray-600 mb-2">{person.headline}</p>}

                    {person.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {person.location}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={isLoading}
                          onClick={() => setSelectedPerson(person)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Connect with {person.first_name} {person.last_name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="message">Personal message (optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Hi, I'd like to connect with you on Circle..."
                              value={connectionMessage}
                              onChange={(e) => setConnectionMessage(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleConnect(person.id, connectionMessage)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading ? "Sending..." : "Send Request"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPerson(null)
                                setConnectionMessage("")
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
