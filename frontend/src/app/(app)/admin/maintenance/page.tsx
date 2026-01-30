"use client"

import { useState } from "react"
import { useGetTrashStats, useCleanupTrash } from "@/lib/queries/maintenance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, Package, DollarSign, Receipt, FolderKanban, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useGetCurrentUser } from "@/lib/queries"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MaintenancePage() {
  const { data: currentUser } = useGetCurrentUser()
  const { toast } = useToast()
  const [daysOld, setDaysOld] = useState<string>("30")
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)

  const { data: trashStats, isLoading, error, refetch } = useGetTrashStats()
  const cleanupMutation = useCleanupTrash()

  // Check if user is super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin'

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Solo los administradores pueden acceder a esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleCleanup = async () => {
    const days = parseInt(daysOld)
    if (isNaN(days) || days < 1 || days > 365) {
      toast({
        title: "Error",
        description: "Los días deben ser un número entre 1 y 365",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await cleanupMutation.mutateAsync(days)
      toast({
        title: "Limpieza completada",
        description: result.message,
      })
      setCleanupDialogOpen(false)
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al ejecutar la limpieza",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Mantenimiento del Sistema</h1>
          <p className="text-grey-600 mt-1">Gestiona la limpieza de elementos eliminados</p>
        </div>
        <LoadingSkeleton type="card" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Mantenimiento del Sistema</h1>
          <p className="text-grey-600 mt-1">Gestiona la limpieza de elementos eliminados</p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Error al cargar estadísticas"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Mantenimiento del Sistema</h1>
        <p className="text-grey-600 mt-1">Gestiona la limpieza de elementos eliminados</p>
      </div>

      {/* Trash Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Papelera</CardTitle>
          <CardDescription>Elementos eliminados (soft delete) actualmente en la papelera</CardDescription>
        </CardHeader>
        <CardContent>
          {trashStats && trashStats.total === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-muted-foreground">No hay elementos en la papelera</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servicios</p>
                  <p className="text-2xl font-bold">{trashStats?.services || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Costos Fijos</p>
                  <p className="text-2xl font-bold">{trashStats?.costs || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impuestos</p>
                  <p className="text-2xl font-bold">{trashStats?.taxes || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FolderKanban className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proyectos</p>
                  <p className="text-2xl font-bold">{trashStats?.projects || 0}</p>
                </div>
              </div>
            </div>
          )}

          {trashStats && trashStats.total > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total en papelera</p>
                  <p className="text-3xl font-bold text-orange-600">{trashStats.total}</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Elementos eliminados
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Limpieza de Papelera</CardTitle>
          <CardDescription>
            Elimina permanentemente elementos que han estado en la papelera por más de X días
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta acción es <strong>irreversible</strong>. Los elementos eliminados permanentemente no podrán ser recuperados.
              Solo se eliminarán elementos que hayan estado en la papelera por más del número de días especificado.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="daysOld">Días en papelera antes de eliminar</Label>
            <Input
              id="daysOld"
              type="number"
              min="1"
              max="365"
              value={daysOld}
              onChange={(e) => setDaysOld(e.target.value)}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Solo se eliminarán elementos que hayan estado en la papelera por más de {daysOld || 30} días
            </p>
          </div>

          <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={!trashStats || trashStats.total === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Ejecutar Limpieza
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Limpieza</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar permanentemente los elementos que han estado en la papelera por más de {daysOld || 30} días?
                </DialogDescription>
              </DialogHeader>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta acción no se puede deshacer. Los elementos serán eliminados permanentemente.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCleanupDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCleanup}
                  disabled={cleanupMutation.isPending}
                >
                  {cleanupMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Confirmar y Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {cleanupMutation.isSuccess && cleanupMutation.data && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Limpieza completada:</strong> {cleanupMutation.data.message}
                <br />
                <span className="text-xs">
                  Servicios: {cleanupMutation.data.services_deleted}, 
                  Costos: {cleanupMutation.data.costs_deleted}, 
                  Impuestos: {cleanupMutation.data.taxes_deleted}, 
                  Proyectos: {cleanupMutation.data.projects_deleted}
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
