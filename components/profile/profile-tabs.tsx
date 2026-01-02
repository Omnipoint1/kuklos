"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileTabsProps {
  activeTab: string
  userId: string
}

const tabs = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "posts", label: "Posts" },
]

export function ProfileTabs({ activeTab, userId }: ProfileTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/profile/${userId}?tab=${tab.id}`}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
