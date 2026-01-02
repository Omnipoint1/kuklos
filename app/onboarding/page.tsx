"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, User, Briefcase, GraduationCap } from "lucide-react"

interface OnboardingData {
  firstName: string
  lastName: string
  headline: string
  bio: string
  location: string
  website: string
  skills: string[]
  experience: {
    title: string
    company: string
    startDate: string
    endDate: string
    isCurrent: boolean
    description: string
  }[]
  education: {
    school: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
  }[]
}

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Professional", icon: Briefcase },
  { id: 3, title: "Experience", icon: GraduationCap },
  { id: 4, title: "Complete", icon: CheckCircle },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    skills: [],
    experience: [],
    education: [],
  })

  const [newSkill, setNewSkill] = useState("")
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  })

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Pre-fill with auth metadata if available
      if (user.user_metadata) {
        setData((prev) => ({
          ...prev,
          firstName: user.user_metadata.first_name || "",
          lastName: user.user_metadata.last_name || "",
        }))
      }
    }
    getUser()
  }, [supabase, router])

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setData((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }))
      setNewExperience({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      })
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Update user profile
      const { error: profileError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        first_name: data.firstName,
        last_name: data.lastName,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        website: data.website,
      })

      if (profileError) throw profileError

      // Add skills
      for (const skillName of data.skills) {
        const { error: skillError } = await supabase.from("skills").insert({
          user_id: user.id,
          name: skillName,
        })
        if (skillError) console.error("Skill error:", skillError)
      }

      // Add experience
      for (const exp of data.experience) {
        const { error: expError } = await supabase.from("experience").insert({
          user_id: user.id,
          title: exp.title,
          company: exp.company,
          start_date: exp.startDate,
          end_date: exp.isCurrent ? null : exp.endDate,
          is_current: exp.isCurrent,
          description: exp.description,
        })
        if (expError) console.error("Experience error:", expError)
      }

      router.push("/feed")
    } catch (error) {
      console.error("Onboarding error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Circle!</h1>
          <p className="text-gray-600">Let&apos;s set up your professional profile</p>
          <Progress value={progress} className="mt-4" />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{step.title}</span>
                  {step.id < steps.length && <div className="w-8 h-px bg-gray-300 ml-4" />}
                </div>
              )
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Professional Details"}
              {currentStep === 3 && "Experience & Skills"}
              {currentStep === 4 && "You're All Set!"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "Share your professional background"}
              {currentStep === 3 && "Add your experience and skills"}
              {currentStep === 4 && "Your profile is ready to go"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={data.website}
                    onChange={(e) => setData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Professional */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={data.headline}
                    onChange={(e) => setData((prev) => ({ ...prev, headline: e.target.value }))}
                    placeholder="Software Engineer at Tech Company"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    value={data.bio}
                    onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your professional background, interests, and goals..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Add Your Most Recent Experience</h3>
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience((prev) => ({ ...prev, company: e.target.value }))}
                          placeholder="Tech Corp"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newExperience.startDate}
                          onChange={(e) => setNewExperience((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newExperience.endDate}
                          onChange={(e) => setNewExperience((prev) => ({ ...prev, endDate: e.target.value }))}
                          disabled={newExperience.isCurrent}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCurrent"
                        checked={newExperience.isCurrent}
                        onChange={(e) => setNewExperience((prev) => ({ ...prev, isCurrent: e.target.checked }))}
                      />
                      <Label htmlFor="isCurrent">I currently work here</Label>
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your role and achievements..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={addExperience} variant="outline" className="w-full bg-transparent">
                      Add Experience
                    </Button>
                  </div>

                  {data.experience.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Added Experience:</h4>
                      {data.experience.map((exp, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                          <div className="font-medium">
                            {exp.title} at {exp.company}
                          </div>
                          <div className="text-sm text-gray-600">
                            {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold">Profile Complete!</h3>
                <p className="text-gray-600">
                  You&apos;re ready to start connecting with professionals and building your network on Circle.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What&apos;s next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Explore your personalized feed</li>
                    <li>• Connect with colleagues and industry professionals</li>
                    <li>• Share your first post</li>
                    <li>• Join relevant professional circles</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!data.firstName || !data.lastName)) || (currentStep === 2 && !data.headline)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
