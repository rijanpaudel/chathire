import { generateText } from "ai"

interface FeedbackRequest {
  resume: string
  messages: Array<{
    role: "user" | "ai"
    content: string
  }>
}

interface FeedbackScore {
  label: string
  score: number
  color: string
}

interface FeedbackResponse {
  scores: FeedbackScore[]
  suggestions: string[]
  summary: string
}

export async function POST(request: Request) {
  try {
    const body: FeedbackRequest = await request.json()
    const { resume, messages } = body

    if (!resume || !messages || messages.length === 0) {
      return Response.json({ error: "Missing resume or messages" }, { status: 400 })
    }

    const transcript = messages
      .map((msg) => `${msg.role === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`)
      .join("\n\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert interview coach analyzing a job interview. 
Provide constructive feedback in JSON format with the following structure:
{
  "scores": [
    {"label": "Confidence", "score": 0-100},
    {"label": "Communication Clarity", "score": 0-100},
    {"label": "Technical Depth", "score": 0-100}
  ],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "summary": "Brief overall assessment"
}

Be fair but honest. Consider the candidate's responses, clarity, technical knowledge, and communication skills.`,
      messages: [
        {
          role: "user",
          content: `Please analyze this interview and provide feedback:\n\nResume:\n${resume}\n\nInterview Transcript:\n${transcript}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    })

    const feedbackData = JSON.parse(text) as FeedbackResponse

    return Response.json(feedbackData)
  } catch (error) {
    console.error("Feedback API error:", error)
    return Response.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
