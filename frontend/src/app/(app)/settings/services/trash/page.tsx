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
import { ArrowLeft, RotateCcw, Trash2, Loader2, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useGetDeletedServices,
  useRestoreService,
  usePermanentlyDeleteService,
} from "@/lib/queries"
import { formatPercentage } from "@/lib/utils"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"

interface Service {
  id: number
  name: string
  description?: string
  default_margin_target: number
  is_active: boolean
  deleted_at: string
  deleted_by_id?: number
  deleted_by_name?: string
  deleted_by_email?: string
}

export default function ServicesTrashPage() {
  const router = useRouter()
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [serviceToRestore, setServiceToRestore] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetDeletedServices()
  const restoreMutation = useRestoreService()
  const permanentDeleteMutation = usePermanentlyDeleteService()

  const services = data?.items || []

  const handleRestoreClick = (service: Service) => {
    setServiceToRestore(service)
    setRestoreConfirmOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (serviceToRestore) {
      try {
        await restoreMutation.mutateAsync(serviceToRestore.id)
        toast({
          title: "Success",
          description: "Service restored successfully",
        })
        setServiceToRestore(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to restore service"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await permanentDeleteMutation.mutateAsync(serviceToDelete.id)
        toast({
          title: "Success",
          description: "Service permanently deleted",
        })
        setServiceToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete service"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/settings/services')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Papelera - Servicios</h1>
            <p className="text-muted-foreground">Servicios eliminados que pueden ser restaurados</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicios Eliminados</CardTitle>
          <CardDescription>
            {services.length} servicio{services.length !== 1 ? "s" : ""} en papelera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="space-y-2 py-8">
              <p className="text-sm text-destructive text-center">
                Error loading deleted services: {String(error)}
              </p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                La papelera está vacía
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Servicio</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Margen Objetivo</TableHead>
                  <TableHead>Eliminado por</TableHead>
                  <TableHead>Eliminado el</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: Service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.description || <span className="italic">Sin descripción</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPercentage(service.default_margin_target)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {service.deleted_by_name ? (
                        <div>
                          <div className="font-medium">{service.deleted_by_name}</div>
                          {service.deleted_by_email && (
                            <div className="text-xs text-muted-foreground">{service.deleted_by_email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(service.deleted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreClick(service)}
                          disabled={restoreMutation.isPending}
                          title="Restaurar"
                        >
                          {restoreMutation.isPending && serviceToRestore?.id === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(service)}
                          disabled={permanentDeleteMutation.isPending}
                          title="Eliminar permanentemente"
                        >
                          {permanentDeleteMutation.isPending && serviceToDelete?.id === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        onConfirm={handleRestoreConfirm}
        title="Restaurar Servicio"
        description={`¿Estás seguro de que quieres restaurar "${serviceToRestore?.name}"? El servicio volverá a estar disponible.`}
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permanentemente"
        description={`¿Estás seguro de que quieres eliminar permanentemente "${serviceToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}

