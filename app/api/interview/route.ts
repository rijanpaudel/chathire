import { generateText } from "ai"

interface InterviewRequest {
  resume: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

export async function POST(request: Request) {
  try {
    const body: InterviewRequest = await request.json()
    const { resume, messages } = body

    if (!resume || !messages || messages.length === 0) {
      return Response.json({ error: "Missing resume or messages" }, { status: 400 })
    }

    const systemPrompt = `You are an experienced technical interviewer conducting a realistic job interview. 
You have reviewed the candidate's resume and are conducting a professional interview.

Resume Context:
${resume}

Your role is to:
1. Ask thoughtful, realistic interview questions based on their resume
2. Follow up on their answers with probing questions
3. Assess their technical knowledge, communication skills, and problem-solving ability
4. Be professional but conversational
5. Provide constructive feedback through your questions

Keep responses concise (2-3 sentences) and focused on one question at a time.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 200,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("Interview API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
