"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface NetworkTabsProps {
  activeTab: string
}

const tabs = [
  { id: "connections", label: "Connections", count: null },
  { id: "requests", label: "Requests", count: null },
  { id: "discover", label: "Discover", count: null },
]

export function NetworkTabs({ activeTab }: NetworkTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/network?tab=${tab.id}`}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.label}
            {tab.count && (
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
