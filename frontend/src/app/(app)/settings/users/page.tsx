"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Mail, X, Clock, CheckCircle2, AlertCircle, Copy } from "lucide-react"
import {
  useGetCurrentUser,
  useGetOrganizationUsers,
  useUpdateUserRoleInOrganization,
  useAddUserToOrganization,
  useRemoveUserFromOrganization,
  useGetOrganizationStats,
  useGetInvitations,
  useCancelInvitation,
  useCreateInvitation,
} from "@/lib/queries"
import { OrganizationUser, Invitation } from "@/lib/types/organizations"
import { canInviteUsers } from "@/lib/permissions"
import { LimitIndicator, canCreateResource } from "@/components/organization/LimitIndicator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"

const roleLabels: Record<string, string> = {
  org_admin: "Administrador",
  user: "Miembro",
  org_member: "Miembro", // Mantener para compatibilidad
  super_admin: "Super Admin",
  admin_financiero: "Admin Financiero",
  product_manager: "Product Manager",
}

const roleColors: Record<string, string> = {
  org_admin: "destructive",
  user: "default",
  org_member: "default", // Mantener para compatibilidad
  super_admin: "destructive",
  admin_financiero: "default",
  product_manager: "secondary",
}

export default function UsersSettingsPage() {
  const { data: currentUser } = useGetCurrentUser()
  const organizationId = currentUser?.organization_id
  
  const { data: usersData, isLoading, error } = useGetOrganizationUsers(organizationId ?? 0)
  const { data: orgStats } = useGetOrganizationStats(organizationId ?? 0)
  const { data: invitationsData } = useGetInvitations(organizationId ?? 0)
  const updateRoleMutation = useUpdateUserRoleInOrganization()
  const addUserMutation = useAddUserToOrganization()
  const removeUserMutation = useRemoveUserFromOrganization()
  const createInvitationMutation = useCreateInvitation()
  const cancelInvitationMutation = useCancelInvitation()
  const { toast } = useToast()
  
  const canCreateUser = orgStats 
    ? canCreateResource(orgStats.current_usage.users, orgStats.limits.users)
    : true
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "user" as "org_admin" | "user",
    password: "",
  })
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "user" as "org_admin" | "user",
  })

  const handleCreateUser = async () => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "No se pudo identificar la organización",
        variant: "destructive",
      })
      return
    }

    if (!newUser.email || !newUser.full_name || !newUser.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (newUser.password.length < 8) {
      toast({
        title: "Contraseña débil",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      await addUserMutation.mutateAsync({
        orgId: organizationId,
        data: {
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          password: newUser.password,
        },
      })
      toast({
        title: "Usuario agregado",
        description: `El usuario ${newUser.full_name} ha sido agregado a la organización con rol ${roleLabels[newUser.role]}`,
      })
      setCreateDialogOpen(false)
      setNewUser({
        email: "",
        full_name: "",
        role: "user" as "org_admin" | "user",
        password: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (user: OrganizationUser, newRole: string) => {
    if (!organizationId) return
    if (user.role === newRole) return

    setUpdatingUserId(user.id)
    try {
      await updateRoleMutation.mutateAsync({
        orgId: organizationId,
        userId: user.id,
        data: {
          role: newRole as 'org_admin' | 'user',
        },
      })
      toast({
        title: "Rol actualizado",
        description: `El rol de ${user.full_name || user.email} ha sido actualizado a ${roleLabels[newRole]}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el rol",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRemoveUser = async (user: OrganizationUser) => {
    if (!organizationId) return
    if (!confirm(`¿Estás seguro de que deseas remover a ${user.full_name || user.email} de la organización?`)) {
      return
    }

    setRemovingUserId(user.id)
    try {
      await removeUserMutation.mutateAsync({
        orgId: organizationId,
        userId: user.id,
      })
      toast({
        title: "Usuario removido",
        description: `${user.full_name || user.email} ha sido removido de la organización`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo remover el usuario",
        variant: "destructive",
      })
    } finally {
      setRemovingUserId(null)
    }
  }

  const handleInviteUser = async () => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "No se pudo identificar la organización",
        variant: "destructive",
      })
      return
    }

    if (!inviteData.email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un correo electrónico",
        variant: "destructive",
      })
      return
    }

    try {
      // Use new invitation endpoint
      const invitation = await createInvitationMutation.mutateAsync({
        orgId: organizationId,
        data: {
          email: inviteData.email.trim(),
          role: inviteData.role,
        },
      })
      
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado un email de invitación a ${inviteData.email}`,
      })
      setInviteDialogOpen(false)
      setInviteData({
        email: "",
        role: "user",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar la invitación",
        variant: "destructive",
      })
    }
  }

  const handleCancelInvitation = async (invitationId: number) => {
    if (!organizationId) return
    
    if (!confirm("¿Estás seguro de que deseas cancelar esta invitación?")) {
      return
    }

    try {
      await cancelInvitationMutation.mutateAsync({
        orgId: organizationId,
        invitationId,
      })
      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cancelar la invitación",
        variant: "destructive",
      })
    }
  }

  const getInvitationStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; label: string }> = {
      pending: { variant: 'outline', icon: Clock, label: 'Pendiente' },
      accepted: { variant: 'default', icon: CheckCircle2, label: 'Aceptada' },
      expired: { variant: 'destructive', icon: AlertCircle, label: 'Expirada' },
    }
    
    const config = statusConfig[status] || { variant: 'secondary' as const, icon: Clock, label: status }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (!organizationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            No se pudo identificar la organización. Por favor, inicia sesión nuevamente.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios de tu organización</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios de tu organización</p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
          title="Error al cargar usuarios"
          autoRetry={true}
          maxRetries={3}
        />
      </div>
    )
  }

  const users = (usersData?.items && Array.isArray(usersData.items)) ? usersData.items : []
  const canInvite = canInviteUsers(currentUser)

  return (
    <div className="space-y-6">
      <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Usuarios de la Organización</CardTitle>
                  <CardDescription>
                    Agrega usuarios y administra sus roles dentro de tu organización.
                  </CardDescription>
                </div>
                {canInvite && (
                  <div className="flex gap-2">
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Invitar Usuario
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invitar Usuario a la Organización</DialogTitle>
                        <DialogDescription>
                          Envía una invitación por correo electrónico para que un usuario se una a tu organización.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {orgStats && (
                          <LimitIndicator
                            current={orgStats.current_usage.users}
                            limit={orgStats.limits.users}
                            resourceName="Usuarios"
                          />
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">Correo Electrónico</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteRole">Rol</Label>
                          <Select
                            value={inviteData.role}
                            onValueChange={(value) => setInviteData({ ...inviteData, role: value as typeof inviteData.role })}
                          >
                            <SelectTrigger id="inviteRole">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="org_admin">Administrador</SelectItem>
                              <SelectItem value="user">Miembro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-3 bg-info-50 rounded-lg text-sm text-info-700">
                          <p className="font-medium mb-1">¿Cómo funciona?</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Se enviará un email de invitación al usuario</li>
                            <li>El usuario recibirá un link para aceptar la invitación</li>
                            <li>La invitación expira en 7 días</li>
                            <li>Puedes cancelar invitaciones pendientes en cualquier momento</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setInviteDialogOpen(false)}
                          disabled={createInvitationMutation.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleInviteUser}
                          disabled={createInvitationMutation.isPending || !canCreateUser}
                        >
                          {createInvitationMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Enviar Invitación
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                          Completa los datos del nuevo usuario. El rol puede ser cambiado después.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {orgStats && (
                          <LimitIndicator
                            current={orgStats.current_usage.users}
                            limit={orgStats.limits.users}
                            resourceName="Usuarios"
                          />
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Nombre Completo</Label>
                          <Input
                            id="full_name"
                            placeholder="Juan Pérez"
                            value={newUser.full_name}
                            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña inicial</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Rol</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser({ ...newUser, role: value as typeof newUser.role })}
                          >
                            <SelectTrigger id="role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="org_admin">Administrador</SelectItem>
                              <SelectItem value="user">Miembro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateUser}
                          disabled={addUserMutation.isPending || !canCreateUser}
                        >
                          {addUserMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Agregar Usuario
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol Actual</TableHead>
                <TableHead>Cambiar Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay usuarios en la organización
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: OrganizationUser) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role] as any}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user, value)}
                        disabled={updatingUserId === user.id}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="org_admin">Administrador</SelectItem>
                          <SelectItem value="user">Miembro</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingUserId === user.id && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin inline-block" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user)}
                        disabled={removingUserId === user.id || user.id === currentUser?.id}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        {removingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Remover"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invitations Section */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones Pendientes</CardTitle>
            <CardDescription>
              Gestiona las invitaciones enviadas a usuarios para unirse a tu organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsData && (invitationsData as any).items && Array.isArray((invitationsData as any).items) && (invitationsData as any).items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Invitación</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((invitationsData as any).items as Invitation[]).map((invitation: Invitation) => {
                  const expiresAt = new Date(invitation.expires_at)
                  const isExpiringSoon = expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000 // Less than 24 hours
                  
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleColors[invitation.role] as any}>
                          {roleLabels[invitation.role] || invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getInvitationStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isExpiringSoon && invitation.status === 'pending' ? 'text-warning-600 font-medium' : 'text-muted-foreground'}`}>
                            {expiresAt.toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {isExpiringSoon && invitation.status === 'pending' && (
                            <AlertCircle className="h-4 w-4 text-warning-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invitation.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            disabled={cancelInvitationMutation.isPending}
                            className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          >
                            {cancelInvitationMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        )}
                        {invitation.status === 'accepted' && (
                          <span className="text-sm text-muted-foreground">Aceptada</span>
                        )}
                        {invitation.status === 'expired' && (
                          <span className="text-sm text-muted-foreground">Expirada</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay invitaciones pendientes</p>
                <p className="text-xs mt-1">Usa el botón "Invitar Usuario" para enviar una invitación</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Descripción de Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Administrador (org_admin)</h4>
            <p className="text-sm text-muted-foreground">
              Puede gestionar usuarios de la organización, agregar y remover miembros, y cambiar roles. Tiene acceso completo a todas las funcionalidades de la organización.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Miembro (user)</h4>
            <p className="text-sm text-muted-foreground">
              Miembro regular de la organización con acceso estándar a las funcionalidades según su rol de usuario (product_manager, admin_financiero, etc.).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
