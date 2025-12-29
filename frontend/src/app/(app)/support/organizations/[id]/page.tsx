"use client"

import { useParams, useRouter } from "next/navigation"
import { useGetSupportOrganization, useGetSupportOrganizationUsage, useGetCurrentUser } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building2, Users, Package, FolderKanban, ArrowLeft, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SUBSCRIPTION_PLANS = [
  { value: 'free', label: 'Free', color: 'bg-grey-100 text-grey-700' },
  { value: 'starter', label: 'Starter', color: 'bg-blue-100 text-blue-700' },
  { value: 'professional', label: 'Professional', color: 'bg-purple-100 text-purple-700' },
  { value: 'enterprise', label: 'Enterprise', color: 'bg-primary-100 text-primary-700' },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success-50 text-success-700 border-success-200',
  cancelled: 'bg-grey-50 text-grey-700 border-grey-200',
  past_due: 'bg-warning-50 text-warning-700 border-warning-200',
  trialing: 'bg-info-50 text-info-700 border-info-200',
}

export default function SupportOrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = parseInt(params.id as string)
  const { data: currentUser } = useGetCurrentUser()

  const { data: organization, isLoading: orgLoading } = useGetSupportOrganization(organizationId)
  const { data: usageData, isLoading: usageLoading } = useGetSupportOrganizationUsage(organizationId)

  // Check if user has support role
  const isSupportRole = currentUser?.role === 'super_admin' || 
                        currentUser?.role === 'support_manager' || 
                        currentUser?.role === 'data_analyst'
  const isSuperAdmin = currentUser?.role === 'super_admin'

  if (!isSupportRole) {
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

  if (orgLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Organización no encontrada</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const metrics = usageData?.metrics || {}
  const isAnonymized = !isSuperAdmin

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/support")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-grey-900">{organization.name}</h1>
          <p className="text-grey-600 mt-1">Detalles de la organización</p>
        </div>
      </div>

      {/* Info Alert */}
      {isAnonymized && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Estás viendo datos anonimizados. Los salarios exactos, costos precisos y montos específicos han sido ocultados para proteger la privacidad.
          </AlertDescription>
        </Alert>
      )}

      {/* Organization Info */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{organization.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Slug</p>
              <p className="font-medium">{organization.slug}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <Badge 
                variant="outline" 
                className={SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.color || ''}
              >
                {SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.label || organization.subscription_plan}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge 
                variant="outline" 
                className={STATUS_COLORS[organization.subscription_status] || STATUS_COLORS.active}
              >
                {organization.subscription_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Métricas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Usuarios</span>
              </div>
              <span className="font-bold text-lg">
                {isAnonymized && typeof metrics.user_count === 'string' 
                  ? metrics.user_count 
                  : metrics.user_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Proyectos</span>
              </div>
              <span className="font-bold text-lg">
                {isAnonymized && typeof metrics.project_count === 'string' 
                  ? metrics.project_count 
                  : metrics.project_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cotizaciones</span>
              </div>
              <span className="font-bold text-lg">
                {isAnonymized && typeof metrics.quote_count === 'string' 
                  ? metrics.quote_count 
                  : metrics.quote_count || 0}
              </span>
            </div>
            {metrics.credits_available !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Créditos Disponibles</span>
                </div>
                <span className="font-bold text-lg">
                  {isAnonymized && typeof metrics.credits_available === 'string' 
                    ? metrics.credits_available 
                    : metrics.credits_available?.toLocaleString() || 0}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Creada</p>
              <p className="font-medium">{new Date(organization.created_at).toLocaleDateString()}</p>
            </div>
            {organization.updated_at && (
              <div>
                <p className="text-xs text-muted-foreground">Actualizada</p>
                <p className="font-medium">{new Date(organization.updated_at).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Más Información</CardTitle>
          <CardDescription>
            {isAnonymized 
              ? "Los datos mostrados están anonimizados para proteger la privacidad de los clientes"
              : "Información completa de la organización"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage" className="w-full">
            <TabsList>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>
            <TabsContent value="usage" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Usuarios en la organización</p>
                  <p className="text-2xl font-bold">
                    {isAnonymized && typeof metrics.user_count === 'string' 
                      ? metrics.user_count 
                      : metrics.user_count || 0}
                  </p>
                  {isAnonymized && (
                    <p className="text-xs text-muted-foreground mt-1">Dato anonimizado</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Proyectos creados</p>
                  <p className="text-2xl font-bold">
                    {isAnonymized && typeof metrics.project_count === 'string' 
                      ? metrics.project_count 
                      : metrics.project_count || 0}
                  </p>
                  {isAnonymized && (
                    <p className="text-xs text-muted-foreground mt-1">Dato anonimizado</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Cotizaciones generadas</p>
                  <p className="text-2xl font-bold">
                    {isAnonymized && typeof metrics.quote_count === 'string' 
                      ? metrics.quote_count 
                      : metrics.quote_count || 0}
                  </p>
                  {isAnonymized && (
                    <p className="text-xs text-muted-foreground mt-1">Dato anonimizado</p>
                  )}
                </div>
                {metrics.credits_used_this_month !== undefined && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Créditos usados este mes</p>
                    <p className="text-2xl font-bold">
                      {isAnonymized && typeof metrics.credits_used_this_month === 'string' 
                        ? metrics.credits_used_this_month 
                        : metrics.credits_used_this_month?.toLocaleString() || 0}
                    </p>
                    {isAnonymized && (
                      <p className="text-xs text-muted-foreground mt-1">Dato anonimizado</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">ID de Organización</p>
                <p className="font-mono text-sm">{organization.id}</p>
              </div>
              {organization.settings && Object.keys(organization.settings).length > 0 && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Configuraciones</p>
                  <pre className="text-xs bg-grey-50 p-2 rounded overflow-auto">
                    {JSON.stringify(organization.settings, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

