import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"
import { FeedSidebar } from "./feed-sidebar"
import { FeedHeader } from "./feed-header"
import { NewsAndEvents } from "./news-and-events"

interface FeedLayoutProps {
  children: ReactNode
  user: any
  suggestedPeople?: any[]
}

export function FeedLayout({ children, user, suggestedPeople = [] }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      <FeedHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-3">
            <FeedSidebar user={user} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-6">{children}</div>

          {/* Right sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {suggestedPeople.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-5 border-0">
                <h3 className="font-bold mb-4 text-lg">People you may know</h3>
                <div className="space-y-4">
                  {suggestedPeople.slice(0, 3).map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={person.avatar_url || "/placeholder.svg"}
                        alt={`${person.first_name} ${person.last_name}`}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate hover:text-purple-600">
                          {person.first_name} {person.last_name}
                        </p>
                        {person.headline && <p className="text-xs text-gray-500 truncate">{person.headline}</p>}
                      </div>
                      <Button className="gradient-purple text-white rounded-full px-4 text-xs font-semibold hover:opacity-90">
                        Connect
                      </Button>
                    </div>
                  ))}
                  {suggestedPeople.length > 3 && (
                    <div className="text-center pt-2">
                      <a href="/network" className="text-sm font-semibold text-purple-600 hover:text-purple-800">
                        View all suggestions →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-0">
                <h3 className="font-bold mb-4 text-lg">People you may know</h3>
                <p className="text-sm text-gray-500">Coming soon...</p>
              </div>
            )}

            {/* News and Events feed */}
            <NewsAndEvents />
          </div>
        </div>
      </div>
    </div>
  )
}
