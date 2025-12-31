"use client"

import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Algo salió mal</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Ocurrió un error inesperado. Por favor, intenta recargar la página.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Detalles del error (solo en desarrollo)
              </summary>
              <pre className="mt-2 text-xs overflow-auto bg-grey-100 p-2 rounded">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={resetError} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
            >
              Recargar página
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export { ErrorBoundary, type ErrorFallbackProps }




