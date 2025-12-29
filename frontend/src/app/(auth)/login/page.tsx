"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys, CurrentUser } from "@/lib/queries"
import { DollarSign, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const queryClient = useQueryClient()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor, completa correo y contraseña")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      logger.debug("Login response:", response)

      if (response.error) {
        setError(response.error)
      } else if (response.data?.access_token) {
        localStorage.setItem("auth_token", response.data.access_token)
        
        // Fetch current user data to check role and onboarding status
        const userResponse = await apiRequest<CurrentUser>('/auth/me');
        if (userResponse.error) {
          logger.error("Failed to fetch user after login:", userResponse.error);
          setError("Error al obtener datos de usuario. Intenta nuevamente.");
          return;
        }
        const user = userResponse.data;

        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });

        // Only owners need to complete onboarding
        // Other users should go directly to dashboard (owner already configured everything)
        const isOwner = user?.role === 'owner';
        
        if (isOwner) {
          // For owners, check if onboarding is complete
          if (user.organization_id) {
            try {
              const orgResponse = await apiRequest('/organizations/me');
              if (orgResponse.data?.settings?.onboarding_completed) {
                router.push("/dashboard");
              } else {
                router.push("/onboarding");
              }
            } catch (err) {
              logger.error("Failed to fetch organization:", err);
              // If we can't fetch org, assume onboarding not complete for owner
              router.push("/onboarding");
            }
          } else {
            // No organization_id, go to onboarding
            router.push("/onboarding");
          }
        } else {
          // Non-owners always go to dashboard
          router.push("/dashboard");
        }
      } else {
        logger.error("Unexpected response format:", response)
        setError("Respuesta inesperada del servidor. Por favor, intenta nuevamente.")
      }
    } catch (err) {
      logger.error("Login error:", err)
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
            <div className="p-3 rounded-lg bg-error-50 border border-error-500 text-error-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="email" className="text-grey-700">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-grey-700">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-10 bg-white border-grey-300"
              disabled={loading}
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

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-info-50 rounded-lg">
          <p className="text-info-700 text-xs text-center">
            Demo: Ingresa cualquier correo y contraseña para continuar
          </p>
        </div>
      </div>
    </div>
  )
}
