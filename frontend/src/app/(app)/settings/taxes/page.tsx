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
import { Plus, Pencil, Trash2, Loader2, Receipt, Trash } from "lucide-react"
import {
  useGetTaxes,
  useCreateTax,
  useUpdateTax,
  useDeleteTax,
} from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { TaxForm } from "@/components/taxes/tax-form"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Badge } from "@/components/ui/badge"

interface Tax {
  id: number
  name: string
  code: string
  percentage: number
  country?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export default function TaxesSettingsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<Tax | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetTaxes(undefined, false)
  const createMutation = useCreateTax()
  const updateMutation = useUpdateTax()
  const deleteMutation = useDeleteTax()

  const taxes = ((data as any)?.items && Array.isArray((data as any).items)) ? (data as any).items : []

  const handleCreateClick = () => {
    setEditingTax(null)
    setFormOpen(true)
  }

  const handleEditClick = (tax: Tax) => {
    setEditingTax(tax)
    setFormOpen(true)
  }

  const handleDeleteClick = (tax: Tax) => {
    setTaxToDelete(tax)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (taxToDelete) {
      try {
        await deleteMutation.mutateAsync(taxToDelete.id)
        toast({
          title: "Éxito",
          description: "Impuesto eliminado exitosamente",
        })
        setTaxToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al eliminar el impuesto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSubmit = async (data: unknown) => {
    try {
      if (editingTax) {
        await updateMutation.mutateAsync({ id: editingTax.id, data })
        toast({
          title: "Éxito",
          description: "Impuesto actualizado exitosamente",
        })
      } else {
        await createMutation.mutateAsync(data)
        toast({
          title: "Éxito",
          description: "Impuesto creado exitosamente",
        })
      }
      setFormOpen(false)
      setEditingTax(null)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al guardar el impuesto"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impuestos</h1>
          <p className="text-muted-foreground">Gestiona los impuestos que se pueden aplicar a los proyectos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/settings/taxes/trash'}
          >
            <Trash className="h-4 w-4 mr-2" />
            Papelera
          </Button>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Impuesto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Impuestos</CardTitle>
          <CardDescription>
            {taxes.length} impuesto{taxes.length !== 1 ? "s" : ""} configurado{taxes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">
              Error al cargar impuestos: {String(error)}
            </p>
          ) : taxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                Aún no hay impuestos configurados. Crea tu primer impuesto para comenzar.
              </p>
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Impuesto
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxes.map((tax: Tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{tax.code}</code>
                      </TableCell>
                      <TableCell>{tax.percentage}%</TableCell>
                      <TableCell>{tax.country || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={tax.is_active ? "default" : "secondary"}>
                          {tax.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(tax)}
                            disabled={updateMutation.isPending}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(tax)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && taxToDelete?.id === tax.id ? (
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
            </div>
          )}
        </CardContent>
      </Card>

      <TaxForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        defaultValues={editingTax || undefined}
        mode={editingTax ? "edit" : "create"}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Tax"
        description={`Are you sure you want to delete "${taxToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}



