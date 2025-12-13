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
import { Loader2, Plus } from "lucide-react"
import {
  useGetUsers,
  useUpdateUserRole,
  useCreateUser,
  User,
} from "@/lib/queries"
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

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin_financiero: "Admin Financiero",
  product_manager: "Product Manager",
}

const roleColors: Record<string, string> = {
  super_admin: "destructive",
  admin_financiero: "default",
  product_manager: "secondary",
}

export default function UsersSettingsPage() {
  const { data, isLoading, error } = useGetUsers()
  const updateRoleMutation = useUpdateUserRole()
  const createUserMutation = useCreateUser()
  const { toast } = useToast()
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "product_manager" as "super_admin" | "admin_financiero" | "product_manager",
    password: "",
  })

  const handleCreateUser = async () => {
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
      await createUserMutation.mutateAsync({
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        password: newUser.password,
      })
      toast({
        title: "Usuario creado",
        description: `El usuario ${newUser.full_name} ha sido creado con rol ${roleLabels[newUser.role]}`,
      })
      setCreateDialogOpen(false)
      setNewUser({
        email: "",
        full_name: "",
        role: "product_manager" as "super_admin" | "admin_financiero" | "product_manager",
        password: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (user: User, newRole: string) => {
    if (user.role === newRole) return

    setUpdatingUserId(user.id)
    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        role: newRole as 'super_admin' | 'admin_financiero' | 'product_manager',
      })
      toast({
        title: "Rol actualizado",
        description: `El rol de ${user.full_name} ha sido actualizado a ${roleLabels[newRole]}`,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Error al cargar usuarios"}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const users = data?.items || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios y Roles</CardTitle>
              <CardDescription>
                Crea usuarios y administra sus roles. Solo los Super Admins pueden crear usuarios y modificar roles.
              </CardDescription>
            </div>
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
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin_financiero">Admin Financiero</SelectItem>
                        <SelectItem value="product_manager">Product Manager</SelectItem>
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
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
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
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin_financiero">Admin Financiero</SelectItem>
                          <SelectItem value="product_manager">Product Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingUserId === user.id && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin inline-block" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descripción de Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Super Admin</h4>
            <p className="text-sm text-muted-foreground">
              Puede crear, editar y eliminar todo sin restricciones. Puede aprobar solicitudes de eliminación.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Admin Financiero</h4>
            <p className="text-sm text-muted-foreground">
              Puede crear, editar y eliminar costos, servicios e impuestos. Las eliminaciones requieren aprobación del Super Admin.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Product Manager</h4>
            <p className="text-sm text-muted-foreground">
              Solo puede crear, editar y eliminar proyectos y cotizaciones. Las eliminaciones requieren aprobación del Super Admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

