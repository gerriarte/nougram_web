"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetSupportOrganizations, useGetCurrentUser } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building2, Users, Package, FolderKanban, Search, Filter, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { Organization } from "@/lib/types/organizations"

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

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="w-4 h-4" />
    case 'cancelled':
      return <XCircle className="w-4 h-4" />
    case 'past_due':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function SupportPage() {
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: organizationsData, isLoading, error, refetch } = useGetSupportOrganizations(page, pageSize, false)

  // Check if user has support role
  const isSupportRole = currentUser?.role === 'super_admin' || 
                        currentUser?.role === 'support_manager' || 
                        currentUser?.role === 'data_analyst'

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
          <p className="text-grey-600 mt-1">Gestiona y visualiza todas las organizaciones (datos anonimizados)</p>
        </div>
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
          <p className="text-grey-600 mt-1">Gestiona y visualiza todas las organizaciones (datos anonimizados)</p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Error al cargar organizaciones"
        />
      </div>
    )
  }

  const organizations = organizationsData?.items || []
  
  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchTerm || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = planFilter === "all" || org.subscription_plan === planFilter
    const matchesStatus = statusFilter === "all" || org.subscription_status === statusFilter
    return matchesSearch && matchesPlan && matchesStatus
  })

  // Calculate aggregate metrics
  const totalOrganizations = filteredOrganizations.length
  const totalUsers = filteredOrganizations.reduce((sum, org) => sum + (org.user_count || 0), 0)
  const plansCount = filteredOrganizations.reduce((acc, org) => {
    acc[org.subscription_plan] = (acc[org.subscription_plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleViewOrganization = (orgId: number) => {
    router.push(`/support/organizations/${orgId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
        <p className="text-grey-600 mt-1">Gestiona y visualiza todas las organizaciones (datos anonimizados)</p>
      </div>

      {/* Info Alert */}
      {currentUser?.role !== 'super_admin' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Estás viendo datos anonimizados. Los salarios, costos exactos y montos precisos han sido ocultados para proteger la privacidad.
          </AlertDescription>
        </Alert>
      )}

      {/* Aggregate Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizations}</div>
            <p className="text-xs text-muted-foreground mt-1">Organizaciones activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Usuarios en todas las organizaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribución por Plan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(plansCount).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {SUBSCRIPTION_PLANS.find(p => p.value === plan)?.label || plan}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
              <Input
                placeholder="Buscar organizaciones..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {SUBSCRIPTION_PLANS.map(plan => (
                  <SelectItem key={plan.value} value={plan.value}>{plan.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="past_due">Vencido</SelectItem>
                <SelectItem value="trialing">Prueba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizaciones</CardTitle>
          <CardDescription>
            {filteredOrganizations.length === organizations.length
              ? `Mostrando ${organizations.length} organizaciones`
              : `Mostrando ${filteredOrganizations.length} de ${organizations.length} organizaciones`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No se encontraron organizaciones</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Organización</TableHead>
                      <TableHead className="min-w-[100px]">Plan</TableHead>
                      <TableHead className="min-w-[100px]">Estado</TableHead>
                      <TableHead className="min-w-[80px]">Usuarios</TableHead>
                      <TableHead className="min-w-[100px]">Creada</TableHead>
                      <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org: Organization) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-grey-900">{org.name}</div>
                            <div className="text-sm text-grey-500">{org.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={SUBSCRIPTION_PLANS.find(p => p.value === org.subscription_plan)?.color || ''}
                          >
                            {SUBSCRIPTION_PLANS.find(p => p.value === org.subscription_plan)?.label || org.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={STATUS_COLORS[org.subscription_status] || STATUS_COLORS.active}
                          >
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(org.subscription_status)}
                              {org.subscription_status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-grey-400" aria-hidden="true" />
                            <span>{org.user_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-grey-600">
                            {new Date(org.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrganization(org.id)}
                            aria-label={`Ver detalles de ${org.name}`}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {organizationsData && organizationsData.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, organizationsData.total)} de {organizationsData.total} organizaciones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Página anterior"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground" aria-label={`Página ${page} de ${organizationsData.total_pages}`}>
                      Página {page} de {organizationsData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(organizationsData.total_pages, p + 1))}
                      disabled={page === organizationsData.total_pages}
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

