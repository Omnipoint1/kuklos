"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Star, MessageCircle, Church, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Extended mock data for individual profiles
const profilesData = {
  1: {
    id: 1,
    name: "Sarah Johnson",
    age: 28,
    location: "Austin, TX",
    faith: "Christian",
    denomination: "Methodist",
    avatar: "/professional-woman.png",
    coverImage: "/church-community.png",
    bio: "Seeking a God-centered relationship built on faith, trust, and shared values. I believe that a strong relationship starts with a strong foundation in Christ.",
    interests: ["Bible Study", "Hiking", "Volunteering", "Music", "Photography", "Cooking"],
    churchInvolvement: "Youth Ministry Leader",
    compatibility: 92,
    lastActive: "2 hours ago",
    education: "Masters in Social Work",
    occupation: "Social Worker",
    churchName: "Grace Methodist Church",
    churchYears: 5,
    favoriteVerse: "Proverbs 31:25 - She is clothed with strength and dignity; she can laugh at the days to come.",
    relationshipGoals: "Looking for a lifelong partner to serve God together and build a Christ-centered family.",
    dealBreakers: ["Different core faith values", "Not interested in marriage", "Substance abuse"],
    photos: [
      "/professional-woman.png",
      "/woman-hiking.png",
      "/placeholder-nyxmh.png",
      "/placeholder-7ibci.png",
    ],
    questions: [
      {
        question: "How important is faith in your daily life?",
        answer:
          "Faith is the cornerstone of everything I do. I start each day with prayer and try to live out Christ's love in all my interactions.",
      },
      {
        question: "What role do you see faith playing in marriage?",
        answer:
          "I believe marriage is a covenant before God, and faith should be the foundation that guides every decision we make together.",
      },
      {
        question: "How do you serve in your community?",
        answer:
          "I lead youth ministry at my church and volunteer at the local homeless shelter twice a month. Service is how I live out my faith.",
      },
    ],
  },
  2: {
    id: 2,
    name: "Michael Chen",
    age: 32,
    location: "San Francisco, CA",
    faith: "Christian",
    denomination: "Baptist",
    avatar: "/professional-asian-man.png",
    coverImage: "/placeholder-zf8v8.png",
    bio: "Looking for a partner to grow in faith together and serve our community. I believe in building relationships that honor God and reflect His love.",
    interests: ["Prayer", "Cooking", "Basketball", "Mission Work", "Technology", "Mentoring"],
    churchInvolvement: "Worship Team",
    compatibility: 88,
    lastActive: "1 day ago",
    education: "BS in Computer Science",
    occupation: "Software Engineer",
    churchName: "First Baptist Church SF",
    churchYears: 8,
    favoriteVerse: "1 Corinthians 13:4-7 - Love is patient, love is kind...",
    relationshipGoals: "Seeking a godly woman to build a marriage that glorifies God and serves others.",
    dealBreakers: ["Lack of commitment to faith", "Not wanting children", "Dishonesty"],
    photos: [
      "/professional-asian-man.png",
      "/man-cooking.png",
      "/placeholder-cjbq4.png",
      "/placeholder-e0c2w.png",
    ],
    questions: [
      {
        question: "How important is faith in your daily life?",
        answer:
          "My faith guides every aspect of my life. I seek God's will in my career, relationships, and service to others.",
      },
      {
        question: "What are your thoughts on family and children?",
        answer:
          "I deeply desire to have a family and raise children who know and love the Lord. Family is a gift from God.",
      },
      {
        question: "How do you handle conflict in relationships?",
        answer:
          "I believe in addressing issues with grace, truth, and prayer. Communication and forgiveness are key to healthy relationships.",
      },
    ],
  },
}

export default function ErosProfilePage() {
  const params = useParams()
  const profileId = Number.parseInt(params.id as string)
  const profile = profilesData[profileId as keyof typeof profilesData]
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Profile not found</h2>
          <p className="text-gray-500 mb-4">The profile you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/eros">Back to Eros</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/eros" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Eros
          </Link>
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.coverImage})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-4 md:mt-0">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                    <p className="text-xl text-gray-600">{profile.age} years old</p>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-green-600">{profile.compatibility}% Match</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-rose-500 hover:bg-rose-600">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="faith">Faith</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Relationship Goals</h4>
                      <p className="text-gray-700">{profile.relationshipGoals}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interests & Hobbies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{profile.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{profile.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{profile.education}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-medium">{profile.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="font-medium text-green-600">{profile.lastActive}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deal Breakers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.dealBreakers.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faith" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Church className="w-5 h-5" />
                    Faith Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faith:</span>
                    <Badge variant="secondary">{profile.faith}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Denomination:</span>
                    <span className="font-medium">{profile.denomination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Church:</span>
                    <span className="font-medium">{profile.churchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member for:</span>
                    <span className="font-medium">{profile.churchYears} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Involvement:</span>
                    <span className="font-medium">{profile.churchInvolvement}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Favorite Scripture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="italic text-gray-700 border-l-4 border-rose-500 pl-4">
                    "{profile.favoriteVerse}"
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setCurrentPhotoIndex(index)}
                    >
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`${profile.name} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="space-y-4">
              {profile.questions.map((qa, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{qa.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{qa.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
