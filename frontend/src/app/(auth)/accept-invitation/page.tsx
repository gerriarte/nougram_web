"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAcceptInvitation } from "@/lib/queries"
import { apiRequest } from "@/lib/api-client"
import type { Invitation } from "@/lib/types/organizations"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator"

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const organizationId = searchParams.get("orgId") ? parseInt(searchParams.get("orgId")!) : null
  
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loadingInvitation, setLoadingInvitation] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const [formData, setFormData] = useState({
    password: "",
    full_name: "",
  })
  
  const acceptInvitationMutation = useAcceptInvitation()

  // Validate token and get invitation info
  useEffect(() => {
    if (!token) {
      setError("Token de invitación no proporcionado")
      setLoadingInvitation(false)
      return
    }

    // Validate token and get invitation details
    const validateToken = async () => {
      try {
        const response = await apiRequest<Invitation>(
          `/organizations/invitations/validate/${token}`
        )
        if (response.error) {
          setError(response.error)
          setLoadingInvitation(false)
          return
        }
        if (response.data) {
          setInvitation(response.data)
          // Check if user exists by trying to get current user (if logged in)
          // For now, we'll assume new user if not logged in
          setIsNewUser(!localStorage.getItem("auth_token"))
        }
      } catch (err) {
        setError("Error al validar el token de invitación")
      } finally {
        setLoadingInvitation(false)
      }
    }

    validateToken()
  }, [token])

  const handleAccept = async () => {
    if (!token || !invitation) {
      setError("Token de invitación inválido")
      return
    }

    const orgId = invitation.organization_id

    if (isNewUser) {
      if (!formData.password || formData.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres")
        return
      }
      if (!formData.full_name.trim()) {
        setError("El nombre completo es requerido")
        return
      }
    }

    try {
      setError(null)
      const response = await acceptInvitationMutation.mutateAsync({
        orgId: orgId,
        token,
        data: isNewUser ? {
          token,
          password: formData.password,
          full_name: formData.full_name,
        } : { token },
      })

      if (response.success && response.access_token) {
        // Store token and redirect
        localStorage.setItem("auth_token", response.access_token)
        
        // Show success message briefly
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(response.message || "Error al aceptar la invitación")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al aceptar la invitación")
    }
  }

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (acceptInvitationMutation.isSuccess && acceptInvitationMutation.data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="h-5 w-5" />
              ¡Invitación Aceptada!
            </CardTitle>
            <CardDescription>
              Has sido agregado exitosamente a la organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {acceptInvitationMutation.data.message}
                <br />
                Redirigiendo al dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary-100 p-3">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-center">Aceptar Invitación</CardTitle>
          <CardDescription className="text-center">
            {invitation ? (
              <>
                Has sido invitado a unirte a una organización
                <br />
                <span className="font-semibold text-grey-900">Rol: {invitation.role}</span>
              </>
            ) : (
              "Has sido invitado a unirte a una organización"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {invitation && (
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-sm text-primary-900 font-medium mb-2">
                  Información de la Invitación
                </p>
                <div className="space-y-1 text-sm text-primary-700">
                  <p><strong>Email:</strong> {invitation.email}</p>
                  <p><strong>Rol asignado:</strong> {invitation.role}</p>
                  <p><strong>Expira:</strong> {new Date(invitation.expires_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-info-50 rounded-lg border border-info-200">
              <p className="text-sm text-info-700">
                <strong>¿Ya tienes una cuenta?</strong>
                <br />
                Si ya tienes una cuenta en Nougram con este email, solo necesitas aceptar la invitación.
                Si no tienes cuenta, completa el formulario para crear una.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="existing-user"
                name="user-type"
                checked={!isNewUser}
                onChange={() => setIsNewUser(false)}
                className="h-4 w-4 text-primary-600"
              />
              <label htmlFor="existing-user" className="text-sm font-medium">
                Ya tengo una cuenta
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="new-user"
                name="user-type"
                checked={isNewUser}
                onChange={() => setIsNewUser(true)}
                className="h-4 w-4 text-primary-600"
              />
              <label htmlFor="new-user" className="text-sm font-medium">
                Crear nueva cuenta
              </label>
            </div>

            {isNewUser && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Juan Pérez"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={acceptInvitationMutation.isPending || (isNewUser && (!formData.password || !formData.full_name))}
            >
              {acceptInvitationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Aceptar Invitación"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

