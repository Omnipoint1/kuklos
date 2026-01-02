import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { postId, existingComments } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("content, author:users!posts_author_id_fkey(first_name, last_name)")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const prompt = `
You are helping generate thoughtful, professional comment suggestions for a social media post.

Post content: "${post.content}"
Author: ${post.author.first_name} ${post.author.last_name}

${existingComments.length > 0 ? `Existing comments for context:\n${existingComments.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : "No existing comments yet."}

Generate 3 diverse, engaging comment suggestions that are:
- Professional and appropriate for a business networking platform
- Thoughtful and add value to the conversation
- Different in tone (supportive, insightful, question-based)
- 1-2 sentences each
- Authentic and not overly promotional

Return only the 3 suggestions, one per line, without numbering or formatting.
`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    })

    const suggestions = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3)
      .map((suggestion) => suggestion.trim())

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error generating comment suggestions:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
