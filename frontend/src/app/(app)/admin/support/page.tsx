"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetSupportOrganizations, useGetSupportOrganizationUsage } from "@/lib/queries/support"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Users, FolderKanban, Package, UserCog, ArrowRight, Search, Filter } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetCurrentUser } from "@/lib/queries"
import { isSupportRole } from "@/lib/permissions"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import Link from "next/link"

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

export default function SupportDashboardPage() {
  const router = useRouter()
  const { data: currentUser } = useGetCurrentUser()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)

  const { data: organizationsData, isLoading, error, refetch } = useGetSupportOrganizations(
    page,
    pageSize,
    includeInactive
  )

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

  // Filter organizations by search query
  const filteredOrganizations = organizationsData?.items.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
          <p className="text-grey-600 mt-1">Gestiona organizaciones y usuarios</p>
        </div>
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
          <p className="text-grey-600 mt-1">Gestiona organizaciones y usuarios</p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Error al cargar organizaciones"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Dashboard de Soporte</h1>
        <p className="text-grey-600 mt-1">Gestiona organizaciones y usuarios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {organizationsData?.items.filter(org => org.subscription_status === 'active').length || 0} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizaciones Activas</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {organizationsData?.items.filter(org => org.subscription_status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Con suscripción activa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizationsData?.items.reduce((sum, org) => sum + (org.user_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En todas las organizaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizaciones Inactivas</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {organizationsData?.items.filter(org => org.subscription_status !== 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Organizaciones</CardTitle>
          <CardDescription>Lista de todas las organizaciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={includeInactive ? "default" : "outline"}
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {includeInactive ? "Ocultar Inactivas" : "Mostrar Inactivas"}
            </Button>
          </div>

          {filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No se encontraron organizaciones" : "No hay organizaciones disponibles"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-muted-foreground">{org.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PLAN_COLORS[org.subscription_plan] || PLAN_COLORS.free}>
                          {org.subscription_plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[org.subscription_status] || STATUS_COLORS.active}>
                          {org.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{org.user_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/support/organizations/${org.id}`)}
                          >
                            Ver Detalles
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          {currentUser?.role === 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/organizations/${org.id}/credits`)}
                            >
                              Créditos
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {page} de {organizationsData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(organizationsData.total_pages, p + 1))}
                      disabled={page === organizationsData.total_pages}
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
