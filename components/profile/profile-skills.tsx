"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Award } from "lucide-react"

interface Skill {
  id: string
  name: string
  endorsements: number
}

interface ProfileSkillsProps {
  skills: Skill[]
  canEdit: boolean
}

export function ProfileSkills({ skills, canEdit }: ProfileSkillsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Skills
        </CardTitle>
        {canEdit && (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-sm py-1 px-3">
                {skill.name}
                {skill.endorsements > 0 && <span className="ml-1 text-xs">({skill.endorsements})</span>}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No skills added yet</p>
            {canEdit && (
              <Button variant="outline" className="mt-4 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Skill
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
