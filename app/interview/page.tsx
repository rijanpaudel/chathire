"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

interface ResumeInsights {
  keywords: string[]
  strengths: string[]
  weaknesses: string[]
}

export default function InterviewPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resume, setResume] = useState("")
  const [insights, setInsights] = useState<ResumeInsights | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedResume = sessionStorage.getItem("resume")
    if (!storedResume) {
      router.push("/")
      return
    }
    setResume(storedResume)
    initializeInterview(storedResume)
  }, [router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeInterview = async (resumeText: string) => {
    const keywords = extractKeywords(resumeText)
    const strengths = extractStrengths(resumeText)
    const weaknesses = identifyWeaknesses(resumeText)

    setInsights({ keywords, strengths, weaknesses })

    const greeting: Message = {
      id: "1",
      role: "ai",
      content:
        "Hello! I'm your AI interview coach. I've reviewed your résumé and I'm ready to conduct a realistic interview. Let's start with a classic question: Can you tell me about yourself and your professional background?",
      timestamp: new Date(),
    }
    setMessages([greeting])
  }

  const extractKeywords = (text: string): string[] => {
    const keywords = ["Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Leadership", "Project Management"]
    return keywords.filter((k) => text.includes(k)).slice(0, 5)
  }

  const extractStrengths = (text: string): string[] => {
    const strengths = []
    if (text.includes("lead") || text.includes("Lead")) strengths.push("Leadership experience")
    if (text.includes("project") || text.includes("Project")) strengths.push("Project management")
    if (text.includes("team") || text.includes("Team")) strengths.push("Team collaboration")
    return strengths.length > 0 ? strengths : ["Strong technical foundation"]
  }

  const identifyWeaknesses = (text: string): string[] => {
    const weaknesses = []
    if (!text.includes("certification") && !text.includes("Certification")) {
      weaknesses.push("Consider adding certifications")
    }
    if (text.length < 500) {
      weaknesses.push("Resume could be more detailed")
    }
    return weaknesses
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          messages: [...messages, { role: "user", content: input }].map((msg) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndInterview = () => {
    sessionStorage.setItem("interviewMessages", JSON.stringify(messages))
    router.push("/report")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Interview Session</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-slide-up ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "ai" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-fade-in">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary text-foreground px-4 py-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your response..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="font-bold text-foreground mb-4">Résumé Insights</h2>

              {insights && (
                <div className="space-y-4">
                  {/* Keywords */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {insights.keywords.map((keyword) => (
                        <span key={keyword} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {insights.strengths.map((strength) => (
                        <li key={strength} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Areas to Improve</h3>
                    <ul className="space-y-1">
                      {insights.weaknesses.map((weakness) => (
                        <li key={weakness} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-1">!</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* End interview button */}
              <Button onClick={handleEndInterview} variant="outline" className="w-full mt-6 bg-transparent">
                End Interview
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
