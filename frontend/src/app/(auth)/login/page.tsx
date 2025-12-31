"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Loader2, AlertCircle } from "lucide-react"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { isAuthenticated } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated: authState } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (authState) {
      const redirectTo = searchParams.get('redirect') || sessionStorage.getItem('redirect_after_login') || '/dashboard'
      sessionStorage.removeItem('redirect_after_login')
      router.push(redirectTo)
    }
  }, [authState, router, searchParams])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor, completa correo y contraseña")
      return
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await login(email.trim(), password)

      if (!result.success) {
        const errorMsg = result.error || "Error al iniciar sesión"
        // Mejorar mensaje de error si es de conexión
        if (errorMsg.includes("conexión") || errorMsg.includes("servidor")) {
          setError(`${errorMsg}\n\nVerifica que el backend esté corriendo en http://localhost:8000`)
        } else {
          setError(errorMsg)
        }
        return
      }

      // Login successful, redirect will be handled by useEffect
      // But we still need to determine where to go based on user role
      const redirectTo = searchParams.get('redirect') || sessionStorage.getItem('redirect_after_login')
      if (redirectTo) {
        sessionStorage.removeItem('redirect_after_login')
        router.push(redirectTo)
        return
      }

      // Default redirect logic (handled by useAuth hook or can be done here)
      router.push("/dashboard")
    } catch (err) {
      setError("No se pudo iniciar sesión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white rounded-xl p-8"
        style={{ boxShadow: 'var(--elevation-8)' }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-500 mb-4">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-grey-900 mb-2">Bienvenido a Nougram</h1>
          <p className="text-grey-600">Inicia sesión para gestionar las cotizaciones de tu agencia creativa</p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="email" className="text-grey-700">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null) // Clear error when user types
              }}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-grey-700">Contraseña</Label>
            <PasswordInput
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null) // Clear error when user types
              }}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-primary-500 hover:bg-primary-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <div className="text-center text-sm text-grey-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary-500 hover:text-primary-700 font-medium">
              Regístrate
            </Link>
          </div>
        </form>

      </div>
    </div>
  )
}
