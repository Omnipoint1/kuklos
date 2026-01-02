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
    <div className="min-h-screen bg-gray-50">
      <FeedHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <FeedSidebar user={user} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">{children}</div>

          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {suggestedPeople.length > 0 ? (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">People you may know</h3>
                <div className="space-y-3">
                  {suggestedPeople.slice(0, 3).map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <img
                        src={person.avatar_url || "/placeholder.svg"}
                        alt={`${person.first_name} ${person.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {person.first_name} {person.last_name}
                        </p>
                        {person.headline && <p className="text-xs text-gray-500 truncate">{person.headline}</p>}
                      </div>
                    </div>
                  ))}
                  {suggestedPeople.length > 3 && (
                    <div className="text-center pt-2">
                      <a href="/network" className="text-sm text-blue-600 hover:text-blue-800">
                        View all suggestions
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">People you may know</h3>
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
