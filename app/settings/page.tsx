import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { User, Bell, Shield, CreditCard, HelpCircle, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  try {
    const supabase = createClient()

    if (!supabase) {
      redirect("/auth/login")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const settingsOptions = [
      {
        title: "Profile",
        description: "Update your personal information and professional details",
        icon: User,
        href: "/settings/profile",
        available: true,
      },
      {
        title: "Notifications",
        description: "Manage your email and push notification preferences",
        icon: Bell,
        href: "/settings/notifications",
        available: true,
      },
      {
        title: "Privacy & Security",
        description: "Control your privacy settings and account security",
        icon: Shield,
        href: "/settings/privacy",
        available: false,
      },
      {
        title: "Billing & Subscription",
        description: "Manage your subscription and payment methods",
        icon: CreditCard,
        href: "/settings/billing",
        available: false,
      },
      {
        title: "Help & Support",
        description: "Get help and contact our support team",
        icon: HelpCircle,
        href: "/settings/help",
        available: false,
      },
    ]

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
          </div>

          <div className="grid gap-4">
            {settingsOptions.map((option) => {
              const Icon = option.icon

              if (option.available) {
                return (
                  <Link key={option.href} href={option.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{option.title}</h3>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }

              return (
                <Card key={option.href} className="opacity-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-500">{option.title}</h3>
                          <p className="text-sm text-gray-400">{option.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/auth/login")
  }
}
