"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Package, 
  FolderKanban,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  Mail,
  AlertCircle,
  Settings,
  TrendingUp
} from "lucide-react"
import { 
  useGetOrganization,
  useGetCurrentUser,
  useGetOrganizationUsers,
  useGetOrganizationStats,
  useUpdateOrganization,
  useUpdateOrganizationSubscription,
} from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { canInviteUsers, canManageSubscription } from "@/lib/permissions"
import { LimitIndicator } from "@/components/organization/LimitIndicator"

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

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const organizationId = parseInt(params.id as string)
  
  const { data: currentUser } = useGetCurrentUser()
  const { data: organization, isLoading: orgLoading } = useGetOrganization(organizationId)
  const { data: orgUsers, isLoading: isLoadingUsers } = useGetOrganizationUsers(organizationId)
  const { data: orgStats, isLoading: isLoadingStats } = useGetOrganizationStats(organizationId)
  
  const updateOrgMutation = useUpdateOrganization()
  const updateSubscriptionMutation = useUpdateOrganizationSubscription()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    slug: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isOwner = currentUser?.role === 'owner' && currentUser?.organization_id === organizationId
  const canEdit = isSuperAdmin || isOwner
  const canManageSub = canManageSubscription(currentUser) && (isSuperAdmin || isOwner)

  // Initialize edit data when organization loads
  if (organization && !editData.name) {
    setEditData({
      name: organization.name,
      slug: organization.slug,
    })
  }

  const handleEdit = async () => {
    if (!editData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      await updateOrgMutation.mutateAsync({
        orgId: organizationId,
        data: {
          name: editData.name,
          slug: editData.slug,
        },
      })
      toast({
        title: "Organización actualizada",
        description: "Los cambios se han guardado correctamente",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la organización",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubscription = async () => {
    if (!selectedPlan) return

    try {
      await updateSubscriptionMutation.mutateAsync({
        orgId: organizationId,
        subscriptionPlan: selectedPlan,
      })
      toast({
        title: "Suscripción actualizada",
        description: `El plan de suscripción se ha actualizado a ${SUBSCRIPTION_PLANS.find(p => p.value === selectedPlan)?.label}`,
      })
      setIsSubscriptionDialogOpen(false)
      setSelectedPlan('')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la suscripción",
        variant: "destructive",
      })
    }
  }

  const openSubscriptionDialog = () => {
    if (organization) {
      setSelectedPlan(organization.subscription_plan)
      setIsSubscriptionDialogOpen(true)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'past_due':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-error-500'
    if (percentage >= 70) return 'bg-warning-500'
    return 'bg-success-500'
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
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
          <CardContent>
            <Button onClick={() => router.push('/settings/organizations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/settings/organizations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">{organization.name}</h1>
            <p className="text-grey-600 mt-1">Detalles y configuración de la organización</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {canManageSub && (
              <Button
                variant="outline"
                onClick={openSubscriptionDialog}
              >
                <Settings className="w-4 h-4 mr-2" />
                Cambiar Plan
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Limit Warnings */}
      {orgStats && (
        <>
          {orgStats.usage_percentage.users >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Has alcanzado el {orgStats.usage_percentage.users.toFixed(0)}% del límite de usuarios. 
                Considera hacer upgrade de plan.
              </AlertDescription>
            </Alert>
          )}
          {orgStats.usage_percentage.projects >= 90 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Has alcanzado el {orgStats.usage_percentage.projects.toFixed(0)}% del límite de proyectos. 
                Considera hacer upgrade de plan.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="users">
            Usuarios {orgUsers && `(${orgUsers.total})`}
          </TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Organización</CardTitle>
              <CardDescription>Detalles generales de la organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-grey-600">Nombre</Label>
                  <p className="text-grey-900 font-medium mt-1">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-grey-600">Slug</Label>
                  <p className="text-grey-900 font-mono text-sm mt-1">{organization.slug}</p>
                </div>
                <div>
                  <Label className="text-grey-600">Plan de Suscripción</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.color || ''}
                    >
                      {SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.label || organization.subscription_plan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-grey-600">Estado</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={STATUS_COLORS[organization.subscription_status] || STATUS_COLORS.active}
                    >
                      <span className="flex items-center gap-1.5">
                        {getStatusIcon(organization.subscription_status)}
                        {organization.subscription_status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-grey-600">Fecha de Creación</Label>
                  <p className="text-grey-900 text-sm mt-1">
                    {new Date(organization.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-grey-600">Última Actualización</Label>
                  <p className="text-grey-900 text-sm mt-1">
                    {organization.updated_at 
                      ? new Date(organization.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuarios de la Organización</CardTitle>
                  <CardDescription>
                    {orgUsers?.total || 0} usuario{(orgUsers?.total || 0) !== 1 ? 's' : ''} en la organización
                  </CardDescription>
                </div>
                {canInviteUsers(currentUser) && (
                  <Button onClick={() => router.push('/settings/users')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Invitar Usuario
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : orgUsers && orgUsers.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgUsers.items.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.role === 'org_admin' ? 'Administrador' : 
                             user.role === 'owner' ? 'Propietario' :
                             user.role === 'admin_financiero' ? 'Admin Financiero' :
                             user.role === 'product_manager' ? 'Product Manager' :
                             user.role === 'collaborator' ? 'Colaborador' : 'Miembro'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/settings/users')}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-grey-500">
                  No hay usuarios en la organización
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
              <CardDescription>Uso actual de recursos de la organización</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
              ) : orgStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Users */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">Usuarios</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.users}</p>
                        {orgStats.limits.users !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              de {orgStats.limits.users} ({orgStats.usage_percentage.users.toFixed(0)}%)
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.users} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">Ilimitado</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">Proyectos</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.projects}</p>
                        {orgStats.limits.projects !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              de {orgStats.limits.projects} ({orgStats.usage_percentage.projects.toFixed(0)}%)
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.projects} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">Ilimitado</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Services */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">Servicios</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.services}</p>
                        {orgStats.limits.services !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              de {orgStats.limits.services} ({orgStats.usage_percentage.services.toFixed(0)}%)
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.services} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">Ilimitado</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-grey-600" />
                            <Label className="text-grey-600">Miembros del Equipo</Label>
                          </div>
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                        </div>
                        <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.team_members}</p>
                        {orgStats.limits.team_members !== -1 ? (
                          <>
                            <p className="text-xs text-grey-500 mt-1">
                              de {orgStats.limits.team_members} ({orgStats.usage_percentage.team_members.toFixed(0)}%)
                            </p>
                            <Progress 
                              value={orgStats.usage_percentage.team_members} 
                              className="mt-2 h-2"
                            />
                          </>
                        ) : (
                          <p className="text-xs text-grey-500 mt-1">Ilimitado</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Limit Indicators */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-grey-900">Límites del Plan</h3>
                    <LimitIndicator
                      current={orgStats.current_usage.users}
                      limit={orgStats.limits.users}
                      resourceName="Usuarios"
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.projects}
                      limit={orgStats.limits.projects}
                      resourceName="Proyectos"
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.services}
                      limit={orgStats.limits.services}
                      resourceName="Servicios"
                    />
                    <LimitIndicator
                      current={orgStats.current_usage.team_members}
                      limit={orgStats.limits.team_members}
                      resourceName="Miembros del Equipo"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-grey-500">
                  No se pudieron cargar las estadísticas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Configuración avanzada de la organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.settings && Object.keys(organization.settings).length > 0 ? (
                <div className="space-y-2">
                  <Label>Configuración (JSON)</Label>
                  <pre className="p-4 bg-grey-50 rounded-lg text-sm overflow-auto max-h-96">
                    {JSON.stringify(organization.settings, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-grey-500">
                  No hay configuración personalizada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Organización</DialogTitle>
            <DialogDescription>
              Actualiza la información de la organización
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Nombre de la organización"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={editData.slug}
                onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                placeholder="slug-de-la-organizacion"
              />
              <p className="text-xs text-grey-500">
                El slug debe ser único y solo contener letras, números y guiones
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateOrgMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateOrgMutation.isPending || !editData.name.trim()}
            >
              {updateOrgMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription>
              Actualiza el plan de suscripción para {organization.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan de Suscripción</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger id="plan" className="h-10">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {organization && (
              <div className="p-3 bg-grey-50 rounded-lg text-sm text-grey-600">
                <p>Plan actual: <strong className="text-grey-900">
                  {SUBSCRIPTION_PLANS.find(p => p.value === organization.subscription_plan)?.label}
                </strong></p>
                <p>Estado actual: <strong className="text-grey-900">{organization.subscription_status}</strong></p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionDialogOpen(false)}
              disabled={updateSubscriptionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              disabled={updateSubscriptionMutation.isPending || !selectedPlan}
            >
              {updateSubscriptionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

