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
  useGetDeletedFixedCosts,
  useRestoreFixedCost,
  usePermanentlyDeleteFixedCost,
} from "@/lib/queries"
import { formatCurrency, getCurrencyName } from "@/lib/currency"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface FixedCost {
  id: number
  name: string
  amount_monthly: number
  currency: string
  category: string
  description?: string
  deleted_at: string
  deleted_by_id?: number
  deleted_by_name?: string
  deleted_by_email?: string
}

export default function CostsTrashPage() {
  const router = useRouter()
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [costToRestore, setCostToRestore] = useState<FixedCost | null>(null)
  const [costToDelete, setCostToDelete] = useState<FixedCost | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetDeletedFixedCosts()
  const restoreMutation = useRestoreFixedCost()
  const permanentDeleteMutation = usePermanentlyDeleteFixedCost()

  const costs = ((data as any)?.items && Array.isArray((data as any).items)) ? (data as any).items : []

  const handleRestoreClick = (cost: FixedCost) => {
    setCostToRestore(cost)
    setRestoreConfirmOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (costToRestore) {
      try {
        await restoreMutation.mutateAsync(costToRestore.id)
        toast({
          title: "Success",
          description: "Costo restaurado exitosamente",
        })
        setCostToRestore(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al restaurar costo"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (cost: FixedCost) => {
    setCostToDelete(cost)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (costToDelete) {
      try {
        await permanentDeleteMutation.mutateAsync(costToDelete.id)
        toast({
          title: "Success",
          description: "Costo eliminado permanentemente",
        })
        setCostToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al eliminar costo"
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
            onClick={() => router.push('/settings/costs')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Papelera - Costos Fijos</h1>
            <p className="text-muted-foreground">Costos eliminados que pueden ser restaurados</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Costos Fijos Eliminados</CardTitle>
          <CardDescription>
            {costs.length} costo{costs.length !== 1 ? "s" : ""} en papelera
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
                Error loading deleted costs: {String(error)}
              </p>
            </div>
          ) : costs.length === 0 ? (
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
                  <TableHead>Categoría</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead className="text-right">Monto Mensual</TableHead>
                  <TableHead>Eliminado por</TableHead>
                  <TableHead>Eliminado el</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost: FixedCost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.name}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {cost.currency || "USD"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <div className="flex flex-col items-end gap-1">
                        <span>{formatCurrency(cost.amount_monthly, cost.currency || "USD")}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {getCurrencyName(cost.currency || "USD")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {cost.deleted_by_name ? (
                        <div>
                          <div className="font-medium">{cost.deleted_by_name}</div>
                          {cost.deleted_by_email && (
                            <div className="text-xs text-muted-foreground">{cost.deleted_by_email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(cost.deleted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreClick(cost)}
                          disabled={restoreMutation.isPending}
                          title="Restaurar"
                        >
                          {restoreMutation.isPending && costToRestore?.id === cost.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(cost)}
                          disabled={permanentDeleteMutation.isPending}
                          title="Eliminar permanentemente"
                        >
                          {permanentDeleteMutation.isPending && costToDelete?.id === cost.id ? (
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
        title="Restaurar Costo Fijo"
        description={`¿Estás seguro de que quieres restaurar "${costToRestore?.name}"? El costo volverá a estar disponible.`}
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Permanentemente"
        description={`¿Estás seguro de que quieres eliminar permanentemente "${costToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}

