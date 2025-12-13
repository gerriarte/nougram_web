"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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
        // Store token and redirect
        localStorage.setItem("auth_token", response.data.access_token)
        router.push("/dashboard")
      } else {
        // Si no hay error pero tampoco hay token, algo está mal
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">AgenciaOps</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Ingresar"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
