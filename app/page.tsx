"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [resume, setResume] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setResume(text)
    }
    reader.readAsText(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handlePasteResume = () => {
    navigator.clipboard.read().then(async (items) => {
      for (const item of items) {
        if (item.types.includes("text/plain")) {
          const text = await item.getType("text/plain").then((blob) => blob.text())
          setResume(text)
          setFileName("Pasted Resume")
        }
      }
    })
  }

  const handleStartInterview = () => {
    if (resume.trim()) {
      // Store resume in sessionStorage for the interview page
      sessionStorage.setItem("resume", resume)
      router.push("/interview")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Your AI Interview Coach</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Upload your résumé and practice realistic interviews powered by AI.
          </p>
        </div>

        <Card className="p-8 sm:p-12 mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
              isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Upload Your Résumé</h2>
            <p className="text-muted-foreground mb-6">Drag and drop your PDF or text file here</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label>
                <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileInput} className="hidden" />
                <Button variant="default" asChild className="cursor-pointer">
                  <span>Choose File</span>
                </Button>
              </label>
              <Button variant="outline" onClick={handlePasteResume}>
                Paste Resume
              </Button>
            </div>
          </div>

          {resume && (
            <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">{fileName}</span>
              </div>
              <p className="text-sm text-muted-foreground">{resume.length} characters loaded</p>
            </div>
          )}
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={handleStartInterview} disabled={!resume.trim()} className="px-8">
            Start Interview
          </Button>
        </div>
      </main>
    </div>
  )
}
