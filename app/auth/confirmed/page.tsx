import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Email Confirmed!</CardTitle>
            <CardDescription>Your account has been successfully verified. Welcome to Circle!</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">You can now sign in and start connecting with your faith community.</p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In to Your Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
