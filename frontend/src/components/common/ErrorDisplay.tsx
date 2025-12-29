"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error: Error | string | null
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
}

export function ErrorDisplay({
  error,
  onRetry,
  title = "Error al cargar datos",
  description,
  className,
}: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.message

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          {description || errorMessage}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

