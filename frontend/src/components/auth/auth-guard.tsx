"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isAuthenticated, isTokenExpired, logout } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

const PUBLIC_ROUTES = ['/login', '/register', '/accept-invitation', '/']

export function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const { isAuthenticated: authState, isLoading: authLoading, user } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true)
      setAuthError(null)

      // Check if route is public
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
      
      if (isPublicRoute && !requireAuth) {
        setIsChecking(false)
        return
      }

      // Wait for auth to initialize
      if (authLoading) {
        return
      }

      // Check authentication
      if (!authState) {
        if (requireAuth && !isPublicRoute) {
          // Save intended destination
          if (pathname && pathname !== redirectTo) {
            sessionStorage.setItem('redirect_after_login', pathname)
          }
          router.push(redirectTo)
        }
        setIsChecking(false)
        return
      }

      // Check if token is expired
      if (isTokenExpired()) {
        setAuthError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        logout()
        setIsChecking(false)
        return
      }

      // User is authenticated
      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, requireAuth, redirectTo, router, authState, authLoading])

  // Show loading state
  if (isChecking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show auth error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-error-500" />
              Sesión Expirada
            </CardTitle>
            <CardDescription>
              Tu sesión ha expirado por seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Ir a Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If requireAuth and not authenticated, don't render children
  if (requireAuth && !authState) {
    return null
  }

  return <>{children}</>
}

