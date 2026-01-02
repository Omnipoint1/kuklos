"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ExternalLink, Newspaper } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: "industry" | "company" | "technology"
  readTime: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees: number
  type: "virtual" | "in-person" | "hybrid"
}

export function NewsAndEvents() {
  // Mock data for news and events
  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "AI Revolution in Professional Networking",
      summary: "How artificial intelligence is transforming the way professionals connect and collaborate...",
      source: "Tech Today",
      publishedAt: "2 hours ago",
      category: "technology",
      readTime: "3 min read",
    },
    {
      id: "2",
      title: "Remote Work Trends for 2025",
      summary: "Latest insights on hybrid work models and their impact on professional relationships...",
      source: "Business Weekly",
      publishedAt: "5 hours ago",
      category: "industry",
      readTime: "5 min read",
    },
    {
      id: "3",
      title: "Circle Platform Updates",
      summary: "New features launched this month including enhanced messaging and group collaboration tools...",
      source: "Circle Blog",
      publishedAt: "1 day ago",
      category: "company",
      readTime: "2 min read",
    },
  ]

  const events: Event[] = [
    {
      id: "1",
      title: "Professional Networking Mixer",
      description: "Connect with industry leaders and expand your professional network",
      date: "Dec 15, 2024",
      time: "6:00 PM",
      location: "Downtown Convention Center",
      attendees: 127,
      type: "in-person",
    },
    {
      id: "2",
      title: "AI in Business Webinar",
      description: "Learn how AI is transforming modern business practices",
      date: "Dec 18, 2024",
      time: "2:00 PM",
      location: "Virtual Event",
      attendees: 89,
      type: "virtual",
    },
    {
      id: "3",
      title: "Career Development Workshop",
      description: "Strategies for advancing your professional career in 2025",
      date: "Dec 20, 2024",
      time: "10:00 AM",
      location: "Hybrid Event",
      attendees: 45,
      type: "hybrid",
    },
  ]

  const getCategoryColor = (category: NewsItem["category"]) => {
    switch (category) {
      case "technology":
        return "bg-blue-100 text-blue-800"
      case "industry":
        return "bg-green-100 text-green-800"
      case "company":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "virtual":
        return "bg-blue-100 text-blue-800"
      case "in-person":
        return "bg-green-100 text-green-800"
      case "hybrid":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* News Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="w-5 h-5 text-blue-600" />
            Circle News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {newsItems.map((item) => (
            <div key={item.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <span className="text-xs text-gray-500">{item.publishedAt}</span>
              </div>

              <h4 className="font-medium text-sm mb-1 line-clamp-2 leading-tight">{item.title}</h4>

              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readTime}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View All News
          </Button>
        </CardContent>
      </Card>

      {/* Events Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-green-600" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                  {event.type}
                </Badge>
                <span className="text-xs text-gray-500">{event.date}</span>
              </div>

              <h4 className="font-medium text-sm mb-1 line-clamp-2 leading-tight">{event.title}</h4>

              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  {event.attendees} attending
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Learn More
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View All Events
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
