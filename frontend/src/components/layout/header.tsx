"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Bell } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useGetPendingDeleteRequestsCount, useGetCurrentUser, useUpdateCurrentUser, queryKeys } from "@/lib/queries"

export function Header() {
  const router = useRouter()
  const { data: pendingCount } = useGetPendingDeleteRequestsCount()
  const { data: currentUser } = useGetCurrentUser()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const updateCurrentUser = useUpdateCurrentUser()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    if (currentUser?.full_name) {
      setFullName(currentUser.full_name)
    }
  }, [currentUser?.full_name])

  const handleOpenProfile = () => {
    setFullName(currentUser?.full_name || '')
    setIsProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre válido.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateCurrentUser.mutateAsync({ full_name: fullName })
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser })
      toast({
        title: "Perfil actualizado",
        description: "Tu información fue guardada correctamente.",
      })
      setIsProfileOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    queryClient.clear()
    setIsProfileOpen(false)
    router.push('/')
  }

  const showNotifications = pendingCount && pendingCount > 0

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">AgenciaOps</h2>
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentUser.full_name}</span>
              <Badge variant="outline" className="text-xs">
                {currentUser.role || 'super_admin'}
              </Badge>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {currentUser && showNotifications && (
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            onClick={() => router.push('/settings/approvals')}
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingCount}
            </Badge>
          </Button>
        )}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <Button variant="ghost" size="icon" onClick={handleOpenProfile}>
            <User className="h-5 w-5" />
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perfil de usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Correo</label>
                <Input value={currentUser?.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={handleLogout} className="mb-2 sm:mb-0">
                Cerrar sesión
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={updateCurrentUser.isPending}>
                  {updateCurrentUser.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}

