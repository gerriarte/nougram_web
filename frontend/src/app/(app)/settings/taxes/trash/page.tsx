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
  useGetDeletedTaxes,
  useRestoreTax,
  usePermanentlyDeleteTax,
} from "@/lib/queries"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Tax {
  id: number
  name: string
  code: string
  percentage: number
  country?: string
  is_active: boolean
  deleted_at: string
  deleted_by_id?: number
  deleted_by_name?: string
  deleted_by_email?: string
}

export default function TaxesTrashPage() {
  const router = useRouter()
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taxToRestore, setTaxToRestore] = useState<Tax | null>(null)
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetDeletedTaxes()
  const restoreMutation = useRestoreTax()
  const permanentDeleteMutation = usePermanentlyDeleteTax()

  const taxes = data?.items || []

  const handleRestoreClick = (tax: Tax) => {
    setTaxToRestore(tax)
    setRestoreConfirmOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (taxToRestore) {
      try {
        await restoreMutation.mutateAsync(taxToRestore.id)
        toast({
          title: "Success",
          description: "Impuesto restaurado exitosamente",
        })
        setTaxToRestore(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al restaurar impuesto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (tax: Tax) => {
    setTaxToDelete(tax)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (taxToDelete) {
      try {
        await permanentDeleteMutation.mutateAsync(taxToDelete.id)
        toast({
          title: "Success",
          description: "Impuesto eliminado permanentemente",
        })
        setTaxToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al eliminar impuesto"
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
            onClick={() => router.push('/settings/taxes')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Papelera - Impuestos</h1>
            <p className="text-muted-foreground">Impuestos eliminados que pueden ser restaurados</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impuestos Eliminados</CardTitle>
          <CardDescription>
            {taxes.length} impuesto{taxes.length !== 1 ? "s" : ""} en papelera
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
                Error loading deleted taxes: {String(error)}
              </p>
            </div>
          ) : taxes.length === 0 ? (
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Porcentaje</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Eliminado por</TableHead>
                  <TableHead>Eliminado el</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax: Tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tax.code}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tax.percentage}%
                    </TableCell>
                    <TableCell>{tax.country || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {tax.deleted_by_name ? (
                        <div>
                          <div className="font-medium">{tax.deleted_by_name}</div>
                          {tax.deleted_by_email && (
                            <div className="text-xs text-muted-foreground">{tax.deleted_by_email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(tax.deleted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreClick(tax)}
                          disabled={restoreMutation.isPending}
                          title="Restaurar"
                        >
                          {restoreMutation.isPending && taxToRestore?.id === tax.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(tax)}
                          disabled={permanentDeleteMutation.isPending}
                          title="Eliminar permanentemente"
                        >
                          {permanentDeleteMutation.isPending && taxToDelete?.id === tax.id ? (
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
        title="Restaurar Impuesto"
        description={`¿Estás seguro de que quieres restaurar "${taxToRestore?.name}"? El impuesto volverá a estar disponible.`}
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permanentemente"
        description={`¿Estás seguro de que quieres eliminar permanentemente "${taxToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}

