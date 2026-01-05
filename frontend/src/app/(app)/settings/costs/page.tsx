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
import { Plus, Pencil, Trash2, Loader2, Trash } from "lucide-react"
import {
  useGetFixedCosts,
  useCreateFixedCost,
  useUpdateFixedCost,
  useDeleteFixedCost,
} from "@/lib/queries"
import { CostForm } from "@/components/costs/cost-form"
import { BlendedCostRate } from "@/components/costs/blended-cost-rate"
import { formatCurrency, getCurrencyName } from "@/lib/currency"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"
import { Badge } from "@/components/ui/badge"

interface FixedCost {
  id: number
  name: string
  amount_monthly: number
  currency?: string
  category: string
  created_at: string
  updated_at: string
}

export default function CostsSettingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [costToDelete, setCostToDelete] = useState<FixedCost | null>(null)
  const { toast } = useToast()

  const { data, isLoading, error } = useGetFixedCosts()
  const createMutation = useCreateFixedCost()
  const updateMutation = useUpdateFixedCost()
  const deleteMutation = useDeleteFixedCost()

  const costs = ((data as any)?.items && Array.isArray((data as any).items)) ? (data as any).items : []
  // #region agent log
  const firstCostData = costs[0] ? {id:costs[0].id,name:costs[0].name,amount_monthly:costs[0].amount_monthly,amount_monthly_type:typeof costs[0]?.amount_monthly,amount_monthly_value:costs[0].amount_monthly,currency:costs[0]?.currency} : null
  fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/costs/page.tsx:51',message:'Costs data after API call',data:{costsCount:costs.length,firstCost:firstCostData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Normalize amount_monthly from string to number if needed
  const normalizedCosts = costs.map((cost: any) => ({
    ...cost,
    amount_monthly: typeof cost.amount_monthly === 'string' ? parseFloat(cost.amount_monthly) || 0 : (cost.amount_monthly || 0)
  }))

  const handleCreate = async (formData: { name: string; amount_monthly: number; currency: string; category: string }) => {
    try {
      await createMutation.mutateAsync(formData)
      toast({
        title: "Éxito",
        description: MESSAGES.success.costCreated,
      })
      setIsFormOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.error.costCreate
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      // Don't close the form on error so user can fix it
    }
  }

  const handleUpdate = async (formData: { name: string; amount_monthly: number; currency: string; category: string }) => {
    if (editingCost) {
      try {
        await updateMutation.mutateAsync({ id: editingCost.id, data: formData })
        toast({
          title: "Éxito",
          description: MESSAGES.success.costUpdated,
        })
        setEditingCost(null)
        setIsFormOpen(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : MESSAGES.error.costUpdate
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        // Don't close the form on error so user can fix it
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
        await deleteMutation.mutateAsync(costToDelete.id)
        toast({
          title: "Éxito",
          description: MESSAGES.success.costDeleted,
        })
        setCostToDelete(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : MESSAGES.error.costDelete
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (cost: FixedCost) => {
    setEditingCost(cost)
    setIsFormOpen(true)
  }

  // Group costs by currency for better display
  const costsByCurrency = normalizedCosts.reduce((acc: Record<string, FixedCost[]>, cost: FixedCost) => {
    const currency = cost.currency || "USD"
    if (!acc[currency]) {
      acc[currency] = []
    }
    acc[currency].push(cost)
    return acc
  }, {} as Record<string, FixedCost[]>)

  const hasMultipleCurrencies = Object.keys(costsByCurrency).length > 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Costos Fijos</h1>
          <p className="text-muted-foreground">Gestiona los costos fijos mensuales de tu agencia</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/settings/costs/trash'}
          >
            <Trash className="h-4 w-4 mr-2" />
            Papelera
          </Button>
          <Button onClick={() => setIsFormOpen(true)} disabled={createMutation.isPending || updateMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Costo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Costos Fijos</CardTitle>
              <CardDescription>
                {normalizedCosts.length} costo{normalizedCosts.length !== 1 ? "s" : ""} configurado{normalizedCosts.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="space-y-2 py-8">
                  <p className="text-sm text-destructive text-center">Error al cargar costos: {String(error)}</p>
                </div>
              ) : normalizedCosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {MESSAGES.empty.noCosts}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead className="text-right">Monto Mensual</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {normalizedCosts.map((cost: FixedCost) => {
                      const currency = cost.currency || "USD"
                      return (
                        <TableRow key={cost.id}>
                          <TableCell className="font-medium">{cost.name}</TableCell>
                          <TableCell className="capitalize">{cost.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {currency}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <div className="flex flex-col items-end gap-1">
                              <span>{formatCurrency(cost.amount_monthly || 0, currency)}</span>
                              <span className="text-xs text-muted-foreground font-normal">
                                {getCurrencyName(currency)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(cost)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(cost)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending && costToDelete?.id === cost.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {hasMultipleCurrencies ? (
                      // Show totals by currency when multiple currencies exist
                      Object.entries(costsByCurrency).map(([currency, currencyCosts]) => {
                        const costsArray = currencyCosts as FixedCost[]
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/costs/page.tsx:241',message:'Before total calculation - multi currency',data:{currency,costsArrayLength:costsArray.length,firstAmount:costsArray[0]?.amount_monthly,firstAmountType:typeof costsArray[0]?.amount_monthly},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        const total = costsArray.reduce((sum: number, cost: FixedCost) => {
                          const amount = cost.amount_monthly || 0
                          return sum + (isNaN(amount) ? 0 : amount)
                        }, 0)
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/costs/page.tsx:245',message:'After total calculation - multi currency',data:{currency,total,isNaN:isNaN(total)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        return (
                          <TableRow key={currency} className="font-semibold bg-muted/50">
                            <TableCell colSpan={2}>
                              <div className="flex items-center gap-2">
                                <span>Total ({currency})</span>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {currency}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {currency}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span>{formatCurrency(total, currency)}</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                  {getCurrencyName(currency)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      // Show single total when all costs are in the same currency
                      (() => {
                        const singleCurrency = normalizedCosts[0]?.currency || "USD"
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/costs/page.tsx:290',message:'Before total calculation - single currency',data:{singleCurrency,costsLength:normalizedCosts.length,firstAmount:normalizedCosts[0]?.amount_monthly,firstAmountType:typeof normalizedCosts[0]?.amount_monthly},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        const total = normalizedCosts.reduce((sum: number, cost: FixedCost) => {
                          const amount = cost.amount_monthly || 0
                          return sum + (isNaN(amount) ? 0 : amount)
                        }, 0)
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/costs/page.tsx:277',message:'After total calculation - single currency',data:{singleCurrency,total,isNaN:isNaN(total)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        return (
                          <TableRow className="font-semibold">
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span>{formatCurrency(total, singleCurrency)}</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                  {getCurrencyName(singleCurrency)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )
                      })()
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <BlendedCostRate />
        </div>
      </div>

      <CostForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingCost(null)
          }
        }}
        onSubmit={editingCost ? handleUpdate : handleCreate}
        defaultValues={editingCost ? {
          name: editingCost.name,
          amount_monthly: editingCost.amount_monthly,
          currency: (editingCost.currency || "USD") as "USD" | "COP" | "EUR" | "ARS",
          category: editingCost.category,
        } : undefined}
        mode={editingCost ? "edit" : "create"}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Fixed Cost"
        description={MESSAGES.confirm.deleteCost}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
