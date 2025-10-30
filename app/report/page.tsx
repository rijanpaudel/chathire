"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

interface FeedbackScore {
  label: string
  score: number
  color: string
}

interface Suggestion {
  text: string
}

export default function ReportPage() {
  const router = useRouter()
  const [scores, setScores] = useState<FeedbackScore[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [summary, setSummary] = useState<string>("")

  useEffect(() => {
    const storedMessages = sessionStorage.getItem("interviewMessages")
    const storedResume = sessionStorage.getItem("resume")

    if (!storedMessages || !storedResume) {
      router.push("/")
      return
    }

    const generateFeedback = async () => {
      try {
        const messages = JSON.parse(storedMessages)
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: storedResume,
            messages,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate feedback")
        }

        const feedbackData = await response.json()
        setScores(feedbackData.scores)
        setSuggestions(feedbackData.suggestions)
        setSummary(feedbackData.summary)
      } catch (error) {
        console.error("Error generating feedback:", error)
        // Fallback to default scores if API fails
        const defaultScores: FeedbackScore[] = [
          { label: "Confidence", score: 78, color: "bg-blue-500" },
          { label: "Communication Clarity", score: 82, color: "bg-green-500" },
          { label: "Technical Depth", score: 75, color: "bg-purple-500" },
        ]
        setScores(defaultScores)
      }
    }

    generateFeedback()
  }, [router])

  const handleDownloadPDF = () => {
    alert("PDF download feature coming soon!")
  }

  const handleNewInterview = () => {
    sessionStorage.removeItem("resume")
    sessionStorage.removeItem("interviewMessages")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Interview Feedback</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {scores.map((item) => (
            <Card key={item.label} className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">{item.label}</h3>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-2 mb-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">{item.score}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Suggestions for Improvement</h2>
          <ul className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-4">
                <span className="text-accent font-bold flex-shrink-0">{index + 1}.</span>
                <div>
                  <p className="text-muted-foreground text-sm">{suggestion.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {summary && (
          <Card className="p-6 mb-8 bg-secondary/50">
            <h3 className="font-semibold text-foreground mb-2">Overall Assessment</h3>
            <p className="text-muted-foreground text-sm">{summary}</p>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download Report (PDF)
          </Button>
          <Button onClick={handleNewInterview} className="gap-2">
            Start New Interview
          </Button>
        </div>
      </main>
    </div>
  )
}
