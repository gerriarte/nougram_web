"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useGetAdminCreditBalance, useGetAdminCreditHistory, useGrantManualCredits, useResetMonthlyCredits, useGetOrganization } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, TrendingUp, Calendar, CheckCircle2, ArrowUpRight, ArrowDownRight, Info, Plus, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useGetCurrentUser } from "@/lib/queries"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"

const TRANSACTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  subscription_grant: { label: 'Subscripción', color: 'bg-blue-100 text-blue-700' },
  manual_adjustment: { label: 'Ajuste Manual', color: 'bg-purple-100 text-purple-700' },
  consumption: { label: 'Consumo', color: 'bg-orange-100 text-orange-700' },
  refund: { label: 'Reembolso', color: 'bg-green-100 text-green-700' },
}

function formatTransactionType(type: string): string {
  return TRANSACTION_TYPE_LABELS[type]?.label || type
}

function getTransactionTypeColor(type: string): string {
  return TRANSACTION_TYPE_LABELS[type]?.color || 'bg-grey-100 text-grey-700'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString)
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} de ${month}, ${year}`
}

export default function AdminCreditsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const organizationId = parseInt(params.id as string)
  const { data: currentUser } = useGetCurrentUser()
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [grantAmount, setGrantAmount] = useState<string>("")
  const [grantReason, setGrantReason] = useState<string>("")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const { data: organization } = useGetOrganization(organizationId)
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useGetAdminCreditBalance(organizationId)
  const { data: historyData, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useGetAdminCreditHistory(organizationId, page, pageSize)
  const grantCreditsMutation = useGrantManualCredits()
  const resetCreditsMutation = useResetMonthlyCredits()

  // Check if user is super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin'

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (balanceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/settings/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Créditos - {organization?.name || 'Organización'}</h1>
            <p className="text-grey-600 mt-1">Gestiona los créditos de esta organización</p>
          </div>
        </div>
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (balanceError || !balance) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/settings/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Créditos - {organization?.name || 'Organización'}</h1>
            <p className="text-grey-600 mt-1">Gestiona los créditos de esta organización</p>
          </div>
        </div>
        <ErrorDisplay
          error={balanceError || new Error("No se pudo cargar el balance de créditos")}
          onRetry={() => refetchBalance()}
          title="Error al cargar créditos"
        />
      </div>
    )
  }

  const handleGrantCredits = async () => {
    if (!grantAmount || !grantReason) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const amount = parseInt(grantAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser un número positivo",
        variant: "destructive",
      })
      return
    }

    try {
      await grantCreditsMutation.mutateAsync({
        organizationId,
        data: {
          amount,
          reason: grantReason,
        },
      })
      toast({
        title: "Éxito",
        description: `${amount} créditos otorgados exitosamente`,
      })
      setGrantDialogOpen(false)
      setGrantAmount("")
      setGrantReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al otorgar créditos",
        variant: "destructive",
      })
    }
  }

  const handleResetCredits = async () => {
    try {
      await resetCreditsMutation.mutateAsync(organizationId)
      toast({
        title: "Éxito",
        description: "Reseteo mensual de créditos ejecutado exitosamente",
      })
      setResetDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al resetear créditos",
        variant: "destructive",
      })
    }
  }

  // Calculate usage percentage
  const usagePercentage = balance.credits_per_month && balance.credits_per_month > 0
    ? (balance.credits_used_this_month / balance.credits_per_month) * 100
    : 0

  // Format next reset date
  const nextResetDate = balance.next_reset_at 
    ? formatDateLong(balance.next_reset_at)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/settings/organizations")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Créditos - {organization?.name || 'Organización'}</h1>
          <p className="text-grey-600 mt-1">Gestiona los créditos de esta organización</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponibles</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance.is_unlimited ? '∞' : balance.credits_available.toLocaleString()}
            </div>
            {balance.is_unlimited && (
              <p className="text-xs text-muted-foreground mt-1">Plan ilimitado</p>
            )}
            {balance.manual_credits_bonus > 0 && (
              <p className="text-xs text-green-600 mt-1">
                +{balance.manual_credits_bonus.toLocaleString()} créditos manuales
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usados Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.credits_used_this_month.toLocaleString()}</div>
            {balance.credits_per_month && balance.credits_per_month > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>De {balance.credits_per_month.toLocaleString()} créditos</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage >= 90 ? 'bg-red-600' :
                      usagePercentage >= 70 ? 'bg-orange-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.credits_used_total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Desde el inicio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Reseteo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextResetDate ? (
              <div className="text-sm font-bold">{nextResetDate}</div>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Otorgar Créditos Manualmente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Otorgar Créditos Manualmente</DialogTitle>
              <DialogDescription>
                Agrega créditos adicionales a esta organización. Este cambio se registrará en el historial.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Cantidad de Créditos</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Razón</Label>
                <Textarea
                  id="reason"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="Ej: Bono por cliente premium"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGrantCredits}
                disabled={grantCreditsMutation.isPending}
              >
                {grantCreditsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Otorgar Créditos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Forzar Reseteo Mensual
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Forzar Reseteo Mensual</DialogTitle>
              <DialogDescription>
                Esto ejecutará el reseteo mensual de créditos ahora, otorgando nuevos créditos según el plan de suscripción.
              </DialogDescription>
            </DialogHeader>
            <Alert className="my-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                El reseteo mensual normalmente se ejecuta automáticamente. Usa esta función solo si necesitas forzar un reseteo antes del tiempo programado.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleResetCredits}
                disabled={resetCreditsMutation.isPending}
                variant="default"
              >
                {resetCreditsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Ejecutar Reseteo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>Registro completo de créditos otorgados y consumidos</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <LoadingSkeleton type="table" count={5} />
          ) : historyError ? (
            <ErrorDisplay
              error={historyError}
              onRetry={() => refetchHistory()}
              title="Error al cargar historial"
            />
          ) : !historyData || historyData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Info className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay transacciones disponibles</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Razón</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.items.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTransactionTypeColor(transaction.transaction_type)}>
                          {formatTransactionType(transaction.transaction_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {transaction.amount > 0 ? (
                            <>
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                +{Math.abs(transaction.amount).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-orange-600">
                                -{Math.abs(transaction.amount).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {historyData && historyData.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, historyData.total)} de {historyData.total} transacciones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Página anterior"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground" aria-label={`Página ${page} de ${historyData.total_pages}`}>
                      Página {page} de {historyData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(historyData.total_pages, p + 1))}
                      disabled={page === historyData.total_pages}
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

