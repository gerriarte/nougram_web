"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Package, 
  FolderKanban,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard
} from "lucide-react"
import { 
  useGetOrganizations, 
  useGetCurrentUser, 
  useGetMyOrganization, 
  useUpdateOrganizationSubscription,
  useGetOrganizationUsers,
  useGetOrganizationStats,
} from "@/lib/queries"
import { Organization } from "@/lib/types/organizations"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
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

export default function OrganizationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: currentUser } = useGetCurrentUser()
  const { data: myOrg } = useGetMyOrganization()
  const { data: organizationsData, isLoading } = useGetOrganizations(1, 100, false)
  const updateSubscription = useUpdateOrganizationSubscription()

  // Get organization users and stats for current org (non-super-admin view)
  const { data: orgUsers, isLoading: isLoadingUsers } = useGetOrganizationUsers(myOrg?.id || 0)
  const { data: orgStats, isLoading: isLoadingStats } = useGetOrganizationStats(myOrg?.id || 0)

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const organizations = organizationsData?.items || []
  const isSuperAdmin = currentUser?.role === 'super_admin'
  
  // Use myOrg for non-super-admin view
  const displayOrg = isSuperAdmin ? null : myOrg

  const handleUpdateSubscription = async () => {
    if (!selectedOrg || !selectedPlan) return

    try {
      await updateSubscription.mutateAsync({
        orgId: selectedOrg.id,
        subscriptionPlan: selectedPlan,
      })
      toast({
        title: "Subscription updated",
        description: `Organization subscription plan updated successfully.`,
      })
      setIsSubscriptionDialogOpen(false)
      setSelectedOrg(null)
      setSelectedPlan('')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la suscripción",
        variant: "destructive",
      })
    }
  }

  const openSubscriptionDialog = (org: Organization) => {
    setSelectedOrg(org)
    setSelectedPlan(org.subscription_plan)
    setIsSubscriptionDialogOpen(true)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Organizaciones</h1>
          <p className="text-grey-600 mt-1">
            {isSuperAdmin 
              ? "Gestiona todas las organizaciones y sus suscripciones" 
              : "Ver los detalles de tu organización"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </CardContent>
        </Card>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-grey-400 mb-4" />
            <p className="text-grey-600">No se encontraron organizaciones</p>
          </CardContent>
        </Card>
      ) : displayOrg ? (
        // Non-super-admin: Show organization details with tabs
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="users">Usuarios ({orgUsers?.total || 0})</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Organización</CardTitle>
                <CardDescription>Detalles y configuración de tu organización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-grey-600">Nombre</Label>
                    <p className="text-grey-900 font-medium mt-1">{displayOrg.name}</p>
                  </div>
                  <div>
                    <Label className="text-grey-600">Slug</Label>
                    <p className="text-grey-900 font-mono text-sm mt-1">{displayOrg.slug}</p>
                  </div>
                  <div>
                    <Label className="text-grey-600">Plan de Suscripción</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={SUBSCRIPTION_PLANS.find(p => p.value === displayOrg.subscription_plan)?.color || ''}
                      >
                        {SUBSCRIPTION_PLANS.find(p => p.value === displayOrg.subscription_plan)?.label || displayOrg.subscription_plan}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-grey-600">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={STATUS_COLORS[displayOrg.subscription_status] || STATUS_COLORS.active}
                      >
                        <span className="flex items-center gap-1.5">
                          {getStatusIcon(displayOrg.subscription_status)}
                          {displayOrg.subscription_status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-grey-600">Fecha de Creación</Label>
                    <p className="text-grey-900 text-sm mt-1">
                      {new Date(displayOrg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-grey-600">Usuarios</Label>
                    <p className="text-grey-900 font-medium mt-1">{displayOrg.user_count || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios de la Organización</CardTitle>
                <CardDescription>
                  {orgUsers?.total || 0} usuario{(orgUsers?.total || 0) !== 1 ? 's' : ''} en la organización
                </CardDescription>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgUsers.items.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role === 'org_admin' ? 'Administrador' : 'Miembro'}
                            </Badge>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-grey-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-grey-600" />
                        <Label className="text-grey-600">Usuarios</Label>
                      </div>
                      <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.users}</p>
                      {orgStats.limits.users !== -1 && (
                        <p className="text-xs text-grey-500 mt-1">
                          de {orgStats.limits.users} ({orgStats.usage_percentage.users.toFixed(0)}%)
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-grey-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderKanban className="w-5 h-5 text-grey-600" />
                        <Label className="text-grey-600">Proyectos</Label>
                      </div>
                      <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.projects}</p>
                      {orgStats.limits.projects !== -1 && (
                        <p className="text-xs text-grey-500 mt-1">
                          de {orgStats.limits.projects} ({orgStats.usage_percentage.projects.toFixed(0)}%)
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-grey-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-grey-600" />
                        <Label className="text-grey-600">Servicios</Label>
                      </div>
                      <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.services}</p>
                      {orgStats.limits.services !== -1 && (
                        <p className="text-xs text-grey-500 mt-1">
                          de {orgStats.limits.services} ({orgStats.usage_percentage.services.toFixed(0)}%)
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-grey-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-grey-600" />
                        <Label className="text-grey-600">Miembros del Equipo</Label>
                      </div>
                      <p className="text-2xl font-bold text-grey-900">{orgStats.current_usage.team_members}</p>
                      {orgStats.limits.team_members !== -1 && (
                        <p className="text-xs text-grey-500 mt-1">
                          de {orgStats.limits.team_members} ({orgStats.usage_percentage.team_members.toFixed(0)}%)
                        </p>
                      )}
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
        </Tabs>
      ) : (
        // Super admin: Show organizations list
        <Card>
          <CardHeader>
            <CardTitle>Organizations List</CardTitle>
            <CardDescription>
              {organizations.length} organization{organizations.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
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
                        <Users className="w-4 h-4 text-grey-400" />
                        <span>{org.user_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-grey-600">
                        {new Date(org.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/settings/organizations/${org.id}`)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/organizations/${org.id}/credits`)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Créditos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubscriptionDialog(org)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Update Plan
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Subscription Update Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Subscription Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger id="plan" className="h-10">
                  <SelectValue placeholder="Select a plan" />
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

            {selectedOrg && (
              <div className="p-3 bg-grey-50 rounded-lg text-sm text-grey-600">
                <p>Current plan: <strong className="text-grey-900">{SUBSCRIPTION_PLANS.find(p => p.value === selectedOrg.subscription_plan)?.label}</strong></p>
                <p>Current status: <strong className="text-grey-900">{selectedOrg.subscription_status}</strong></p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionDialogOpen(false)}
              disabled={updateSubscription.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              disabled={updateSubscription.isPending || !selectedPlan}
              className="bg-primary-500 hover:bg-primary-700 text-white"
            >
              {updateSubscription.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
