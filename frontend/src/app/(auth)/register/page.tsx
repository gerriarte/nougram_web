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
import { Loader2, Building2, AlertCircle, CheckCircle2 } from "lucide-react"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Organization fields
  const [organizationName, setOrganizationName] = useState("")
  const [organizationSlug, setOrganizationSlug] = useState("")
  
  // Admin user fields
  const [adminFullName, setAdminFullName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const queryClient = useQueryClient()

  // Auto-generate slug from organization name
  const handleOrganizationNameChange = (value: string) => {
    setOrganizationName(value)
    if (!organizationSlug || organizationSlug === generateSlug(organizationName)) {
      setOrganizationSlug(generateSlug(value))
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim()
      .substring(0, 50)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): string | null => {
    if (!organizationName.trim()) {
      return "El nombre de la organización es requerido"
    }
    if (organizationName.trim().length < 3) {
      return "El nombre de la organización debe tener al menos 3 caracteres"
    }
    if (!adminFullName.trim()) {
      return "El nombre completo es requerido"
    }
    if (adminFullName.trim().length < 2) {
      return "El nombre completo debe tener al menos 2 caracteres"
    }
    if (!adminEmail.trim()) {
      return "El correo electrónico es requerido"
    }
    if (!validateEmail(adminEmail)) {
      return "Por favor, ingresa un correo electrónico válido"
    }
    if (!adminPassword.trim()) {
      return "La contraseña es requerida"
    }
    if (adminPassword.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (adminPassword !== confirmPassword) {
      return "Las contraseñas no coinciden"
    }
    return null
  }

  const handleRegister = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiRequest("/organizations/register", {
        method: "POST",
        body: JSON.stringify({
          organization_name: organizationName.trim(),
          organization_slug: organizationSlug.trim() || undefined,
          admin_email: adminEmail.trim(),
          admin_full_name: adminFullName.trim(),
          admin_password: adminPassword,
          subscription_plan: "free"
        }),
      })

      logger.debug("Register response:", response)

      if (response.error) {
        // Extract error message - could be a string or object with detail
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.detail || 'Error al registrar la organización'
        setError(errorMsg)
        return
      }
      
      if ((response.data as any)?.access_token) {
        // Save token
        localStorage.setItem("auth_token", (response.data as any).access_token)
        
        // Fetch current user data to check onboarding status
        const userResponse = await apiRequest<CurrentUser>('/auth/me');
        if (userResponse.error) {
          logger.error("Failed to fetch user after registration:", userResponse.error);
          setError("Error al obtener datos de usuario. Intenta iniciar sesión.");
          return;
        }
        const user = userResponse.data;

        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations });

        // New organizations always go to onboarding
        router.push("/onboarding");
      } else {
        logger.error("Unexpected response format:", response)
        setError("Respuesta inesperada del servidor. Por favor, intenta nuevamente.")
      }
    } catch (err) {
      logger.error("Registration error:", err)
      setError("No se pudo registrar la organización. Intenta nuevamente.")
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
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-grey-900 mb-2">Crear Organización</h1>
          <p className="text-grey-600">Registra tu organización para comenzar</p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Organization Section */}
          <div className="space-y-4 pb-4 border-b border-grey-200">
            <h2 className="text-sm font-semibold text-grey-900">Información de la Organización</h2>
            
            <div>
              <Label htmlFor="organizationName" className="text-grey-700">
                Nombre de la Organización <span className="text-error-500">*</span>
              </Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Mi Agencia Creativa"
                value={organizationName}
                onChange={(e) => handleOrganizationNameChange(e.target.value)}
                className="mt-2 h-10 bg-white border-grey-300"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="organizationSlug" className="text-grey-700">
                URL (slug)
              </Label>
              <Input
                id="organizationSlug"
                type="text"
                placeholder="mi-agencia-creativa"
                value={organizationSlug}
                onChange={(e) => setOrganizationSlug(e.target.value)}
                className="mt-2 h-10 bg-white border-grey-300 font-mono text-sm"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-grey-500">
                Se genera automáticamente. Puedes editarlo si lo deseas.
              </p>
            </div>
          </div>

          {/* Admin User Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-grey-900">Tu Cuenta de Administrador</h2>
            
            <div>
              <Label htmlFor="adminFullName" className="text-grey-700">
                Nombre Completo <span className="text-error-500">*</span>
              </Label>
              <Input
                id="adminFullName"
                type="text"
                placeholder="Juan Pérez"
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                className="mt-2 h-10 bg-white border-grey-300"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="adminEmail" className="text-grey-700">
                Correo Electrónico <span className="text-error-500">*</span>
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@ejemplo.com"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value)
                  setError(null)
                }}
                className="mt-2 h-10 bg-white border-grey-300"
                disabled={loading}
                autoComplete="email"
                required
              />
              {adminEmail && !validateEmail(adminEmail) && (
                <p className="mt-1 text-xs text-error-500">
                  Por favor, ingresa un correo electrónico válido
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="adminPassword" className="text-grey-700">
                Contraseña <span className="text-error-500">*</span>
              </Label>
              <PasswordInput
                id="adminPassword"
                placeholder="Mínimo 8 caracteres"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value)
                  setError(null)
                }}
                className="mt-2 h-10 bg-white border-grey-300"
                disabled={loading}
                autoComplete="new-password"
                required
                minLength={8}
              />
              {adminPassword && (
                <div className="mt-2">
                  <PasswordStrengthIndicator password={adminPassword} />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-grey-700">
                Confirmar Contraseña <span className="text-error-500">*</span>
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
                className={cn(
                  "mt-2 h-10 bg-white border-grey-300",
                  confirmPassword && adminPassword !== confirmPassword && "border-error-500"
                )}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              {confirmPassword && adminPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-error-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Las contraseñas no coinciden
                </p>
              )}
              {confirmPassword && adminPassword === confirmPassword && adminPassword.length > 0 && (
                <p className="mt-1 text-xs text-success-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Las contraseñas coinciden
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-primary-500 hover:bg-primary-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando organización...
              </>
            ) : (
              'Crear Organización'
            )}
          </Button>

          <div className="text-center text-sm text-grey-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary-500 hover:text-primary-700 font-medium">
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

