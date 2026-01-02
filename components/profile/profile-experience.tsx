"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building, Calendar } from "lucide-react"

interface Experience {
  id: string
  title: string
  company: string
  location?: string
  description?: string
  start_date: string
  end_date?: string
  is_current: boolean
}

interface ProfileExperienceProps {
  experience: Experience[]
  canEdit: boolean
}

export function ProfileExperience({ experience, canEdit }: ProfileExperienceProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Experience
        </CardTitle>
        {canEdit && (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {experience.length > 0 ? (
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{exp.title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company}</p>
                  {exp.location && <p className="text-gray-500 text-sm">{exp.location}</p>}
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current ? "Present" : exp.end_date ? formatDate(exp.end_date) : ""}
                  </div>
                  {exp.description && <p className="text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No experience added yet</p>
            {canEdit && (
              <Button variant="outline" className="mt-4 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Experience
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
