"use client"

import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NotificationHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link href="/settings/notifications">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </Button>
    </div>
  )
}
