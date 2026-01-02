"use client"

import { useState } from "react"
import { useGetMyCreditBalance, useGetMyCreditHistory } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, TrendingUp, Calendar, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line-chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"

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

function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit'
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

export default function CreditsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all")

  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useGetMyCreditBalance()
  const { data: historyData, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useGetMyCreditHistory(page, pageSize)

  if (balanceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Créditos</h1>
          <p className="text-grey-600 mt-1">Gestiona y visualiza el uso de tus créditos</p>
        </div>
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    )
  }

  if (balanceError || !balance) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Créditos</h1>
          <p className="text-grey-600 mt-1">Gestiona y visualiza el uso de tus créditos</p>
        </div>
        <ErrorDisplay
          error={balanceError || new Error("No se pudo cargar el balance de créditos")}
          onRetry={() => refetchBalance()}
          title="Error al cargar créditos"
        />
      </div>
    )
  }

  // Filter transactions by type if filter is set
  const historyItems = (historyData?.items && Array.isArray(historyData.items)) ? historyData.items : []
  const filteredTransactions = transactionTypeFilter === "all" 
    ? historyItems
    : historyItems.filter(t => t.transaction_type === transactionTypeFilter)

  // Calculate usage percentage
  const usagePercentage = balance.credits_per_month && balance.credits_per_month > 0
    ? (balance.credits_used_this_month / balance.credits_per_month) * 100
    : 0

  // Determine credit level color
  const getCreditLevelColor = () => {
    if (balance.is_unlimited) return 'text-green-600'
    if (usagePercentage >= 90) return 'text-red-600'
    if (usagePercentage >= 70) return 'text-orange-600'
    return 'text-green-600'
  }

  // Prepare chart data (group transactions by date)
  const chartData = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const existing = acc.find(d => d.date === date)
    if (existing) {
      existing.credits += Math.abs(transaction.amount)
    } else {
      acc.push({ date, credits: Math.abs(transaction.amount) })
    }
    return acc
  }, [] as Array<{ date: string; credits: number }>).sort((a, b) => a.date.localeCompare(b.date))

  // Format next reset date
  const nextResetDate = balance.next_reset_at 
    ? formatDateLong(balance.next_reset_at)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Créditos</h1>
        <p className="text-grey-600 mt-1">Gestiona y visualiza el uso de tus créditos</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponibles</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCreditLevelColor()}`}>
              {balance.is_unlimited ? '∞' : balance.credits_available.toLocaleString()}
            </div>
            {balance.is_unlimited && (
              <p className="text-xs text-muted-foreground mt-1">Plan ilimitado</p>
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

      {/* Usage Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uso de Créditos</CardTitle>
            <CardDescription>Gráfico temporal del consumo de créditos</CardDescription>
          </CardHeader>
          <CardContent>
              <LineChart
              data={chartData.map(d => ({ month: formatDateShort(d.date), credits: d.credits }))}
              dataKeys={['credits']}
              colors={['#0088FE']}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>Registro completo de créditos otorgados y consumidos</CardDescription>
            </div>
            <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="subscription_grant">Subscripción</SelectItem>
                <SelectItem value="manual_adjustment">Ajuste Manual</SelectItem>
                <SelectItem value="consumption">Consumo</SelectItem>
                <SelectItem value="refund">Reembolso</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Info className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay transacciones disponibles</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Fecha</TableHead>
                      <TableHead className="min-w-[120px]">Tipo</TableHead>
                      <TableHead className="min-w-[100px]">Cantidad</TableHead>
                      <TableHead className="min-w-[200px]">Razón</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          <span className="sr-only">{transaction.created_at ? formatDate(transaction.created_at) : "-"}</span>
                          <span aria-hidden="true">{transaction.created_at ? formatDate(transaction.created_at) : "-"}</span>
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
                                <ArrowUpRight className="h-4 w-4 text-green-600" aria-hidden="true" />
                                <span className="font-medium text-green-600">
                                  +{Math.abs(transaction.amount).toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-4 w-4 text-orange-600" aria-hidden="true" />
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
              </div>
              
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

