"use client"

import { useParams, useRouter } from "next/navigation"
import { useGetSupportOrganization, useGetSupportOrganizationUsage } from "@/lib/queries/support"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Users, FolderKanban, Package, UserCog, ArrowLeft, TrendingUp, CreditCard } from "lucide-react"
import { useGetCurrentUser } from "@/lib/queries"
import { isSupportRole } from "@/lib/permissions"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { Progress } from "@/components/ui/progress"

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-grey-100 text-grey-700',
  starter: 'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-green-100 text-green-700',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  past_due: 'bg-orange-100 text-orange-700',
  trialing: 'bg-yellow-100 text-yellow-700',
}

export default function SupportOrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = parseInt(params.id as string)
  const { data: currentUser } = useGetCurrentUser()

  const { data: organization, isLoading: orgLoading, error: orgError, refetch: refetchOrg } = useGetSupportOrganization(organizationId)
  const { data: usageData, isLoading: usageLoading, error: usageError } = useGetSupportOrganizationUsage(organizationId)

  // Check if user is support role
  if (!currentUser || !isSupportRole(currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/support")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Detalles de Organización</h1>
            <p className="text-grey-600 mt-1">Información y estadísticas de uso</p>
          </div>
        </div>
        <LoadingSkeleton type="card" count={4} />
      </div>
    )
  }

  if (orgError || !organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/support")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Detalles de Organización</h1>
            <p className="text-grey-600 mt-1">Información y estadísticas de uso</p>
          </div>
        </div>
        <ErrorDisplay
          error={orgError || new Error("No se pudo cargar la organización")}
          onRetry={() => refetchOrg()}
          title="Error al cargar organización"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin/support")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-grey-900">{organization.name}</h1>
          <p className="text-grey-600 mt-1">Información y estadísticas de uso</p>
        </div>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Organización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{organization.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="font-medium">{organization.slug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <Badge variant="outline" className={PLAN_COLORS[organization.subscription_plan] || PLAN_COLORS.free}>
                {organization.subscription_plan}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant="outline" className={STATUS_COLORS[organization.subscription_status] || STATUS_COLORS.active}>
                {organization.subscription_status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creada</p>
              <p className="font-medium">
                {new Date(organization.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
            {organization.user_count !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Usuarios</p>
                <p className="font-medium">{organization.user_count}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {usageLoading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : usageError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No se pudieron cargar las estadísticas de uso</p>
          </CardContent>
        </Card>
      ) : usageData ? (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Uso</CardTitle>
            <CardDescription>Límites y uso actual según el plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(usageData.current_usage || {}).map(([key, value]) => {
              const limit = usageData.limits?.[key as keyof typeof usageData.limits] || 0
              const percentage = usageData.usage_percentage?.[key as keyof typeof usageData.usage_percentage] || 0
              const isUnlimited = limit === -1
              const iconMap: Record<string, any> = {
                users: Users,
                projects: FolderKanban,
                services: Package,
                team_members: UserCog,
              }
              const Icon = iconMap[key] || TrendingUp
              const labelMap: Record<string, string> = {
                users: 'Usuarios',
                projects: 'Proyectos',
                services: 'Servicios',
                team_members: 'Miembros del Equipo',
              }
              const label = labelMap[key] || key

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {value} {isUnlimited ? '' : `de ${limit}`}
                    </div>
                  </div>
                  {!isUnlimited && (
                    <Progress value={percentage} className="h-2" />
                  )}
                  {isUnlimited && (
                    <p className="text-xs text-muted-foreground">Ilimitado</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* Actions */}
      {currentUser?.role === 'super_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Administrativas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => router.push(`/admin/organizations/${organization.id}/credits`)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Gestionar Créditos
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/settings/organizations/${organization.id}`)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Ver en Configuración
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
