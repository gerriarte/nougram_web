"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react"

interface ErrorDisplayProps {
  error: Error | string | null
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
  autoRetry?: boolean
  autoRetryDelay?: number
  maxRetries?: number
}

export function ErrorDisplay({
  error,
  onRetry,
  title = "Error al cargar datos",
  description,
  className,
  autoRetry = false,
  autoRetryDelay = 3000,
  maxRetries = 3,
}: ErrorDisplayProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (autoRetry && error && onRetry && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setIsRetrying(true)
        onRetry()
        setRetryCount(prev => prev + 1)
        setTimeout(() => setIsRetrying(false), 1000)
      }, autoRetryDelay)

      return () => clearTimeout(timer)
    }
  }, [error, autoRetry, onRetry, retryCount, maxRetries, autoRetryDelay])

  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.message
  
  // Check if error is transient (network errors, 5xx, etc.)
  const isTransientError = typeof error === "object" && 
    (errorMessage.includes("network") || 
     errorMessage.includes("timeout") || 
     errorMessage.includes("500") ||
     errorMessage.includes("502") ||
     errorMessage.includes("503") ||
     errorMessage.includes("504"))

  const handleRetry = () => {
    setIsRetrying(true)
    if (onRetry) {
      onRetry()
    }
    setTimeout(() => setIsRetrying(false), 1000)
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          {description || errorMessage}
        </p>
        {isTransientError && retryCount < maxRetries && autoRetry && (
          <p className="text-xs text-muted-foreground mb-2">
            Reintentando automáticamente... ({retryCount + 1}/{maxRetries})
          </p>
        )}
        {onRetry && (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}



