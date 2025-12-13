"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Sparkles } from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function AIAdvisor() {
  const [question, setQuestion] = useState("")
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: async (q: string) => {
      const response = await apiRequest('/insights/ai-advisor', {
        method: 'POST',
        body: JSON.stringify({
          question: q,
          ai_provider: 'openai' // or 'gemini'
        }),
      })
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: () => {
      setQuestion("")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to query AI advisor",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      mutation.mutate(question.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle>AI Advisor</CardTitle>
        </div>
        <CardDescription>
          Ask questions about your agency's performance and get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g., What's my average margin? Which services are most profitable?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={mutation.isPending}
          />
          <Button type="submit" disabled={mutation.isPending || !question.trim()}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {mutation.isSuccess && mutation.data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">AI Response:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {mutation.data.answer || "No response received"}
                </p>
                {mutation.data.provider && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Powered by {mutation.data.provider}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {mutation.isError && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "An error occurred"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: AI Advisor requires API keys configured in backend/.env
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}





