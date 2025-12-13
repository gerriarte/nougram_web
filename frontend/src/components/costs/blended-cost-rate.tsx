"use client"

import { useState } from "react"
import { useGetBlendedCostRate } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { Loader2, Coins, Calendar, Info } from "lucide-react"
import { useGetCurrencySettings } from "@/lib/queries"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CurrencyInfo {
  code: string
  count: number
  exchange_rate_to_primary: number
  total_amount: number
}

export function BlendedCostRate() {
  const [infoOpen, setInfoOpen] = useState(false)
  const { data, isLoading, error } = useGetBlendedCostRate()
  const { data: currencySettings } = useGetCurrencySettings()
  const primaryCurrency = data?.primary_currency || currencySettings?.primary_currency || "USD"

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blended Cost Rate</CardTitle>
          <CardDescription>Cost per hour for the agency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blended Cost Rate</CardTitle>
          <CardDescription>Cost per hour for the agency</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error loading cost rate</p>
        </CardContent>
      </Card>
    )
  }

  const costRate = data?.blended_cost_rate || 0
  const totalCosts = data?.total_monthly_costs || 0
  const totalHours = data?.total_monthly_hours || 0
  const activeMembers = data?.active_team_members || 0
  const currenciesUsed: CurrencyInfo[] = data?.currencies_used || []
  const exchangeRatesDate = data?.exchange_rates_date

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Blended Cost Rate</CardTitle>
            <CardDescription>Cost per hour for the agency</CardDescription>
          </div>
          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>¿Cómo se calcula el Blended Cost Rate?</DialogTitle>
                <DialogDescription>
                  Información sobre el cálculo y los datos utilizados
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Fórmula Principal</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    Blended Cost Rate = Total Monthly Costs / Total Monthly Hours
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Componentes del Cálculo</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium text-sm">1. Total Monthly Costs (Costos Mensuales Totales)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Incluye todos los costos fijos mensuales y los salarios brutos de los miembros activos del equipo.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                        <li>Costos fijos: Suma de todos los costos fijos configurados (excluyendo eliminados)</li>
                        <li>Salarios del equipo: Suma de los salarios brutos mensuales de miembros activos</li>
                        <li>Normalización: Todos los costos se convierten a la moneda primaria usando las tasas de cambio</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium text-sm">2. Total Monthly Hours (Horas Mensuales Totales)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Calculado a partir de las horas facturables por semana de cada miembro activo del equipo.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                        <li>Fórmula: Suma de (billable_hours_per_week × 4.33) para cada miembro activo</li>
                        <li>4.33 semanas = Promedio de semanas por mes (52 semanas / 12 meses)</li>
                        <li>Solo se consideran miembros del equipo marcados como activos</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium text-sm">3. Normalización de Monedas</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Todos los costos en diferentes monedas se convierten a la moneda primaria antes del cálculo.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                        <li>Moneda primaria: Configurada en los ajustes de la agencia</li>
                        <li>Tasas de cambio: Se utilizan las tasas configuradas en el sistema</li>
                        <li>Fecha de cotización: Se muestra la fecha de las tasas utilizadas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Datos Actuales Utilizados</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Monthly Costs:</span>
                      <span className="font-semibold">{formatCurrency(totalCosts, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Monthly Hours:</span>
                      <span className="font-semibold">{totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Team Members:</span>
                      <span className="font-semibold">{activeMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Currency:</span>
                      <span className="font-semibold">{primaryCurrency}</span>
                    </div>
                    {currenciesUsed.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Monedas utilizadas:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currenciesUsed.map((currency) => (
                            <Badge key={currency.code} variant="outline" className="font-mono">
                              {currency.code} ({currency.count} items)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Ejemplo de Cálculo</h3>
                  <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                    <p className="text-muted-foreground">
                      Si tienes costos mensuales de {formatCurrency(totalCosts, primaryCurrency)} y {totalHours.toFixed(1)} horas facturables disponibles:
                    </p>
                    <div className="font-mono bg-background p-3 rounded border">
                      {formatCurrency(totalCosts, primaryCurrency)} ÷ {totalHours.toFixed(1)}h = {formatCurrency(costRate, primaryCurrency)}/hora
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Nota:</strong> Este cálculo se actualiza automáticamente cuando agregas, modificas o eliminas costos fijos o miembros del equipo. Los costos eliminados (en papelera) no se incluyen en el cálculo.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Rate */}
          <div>
            <div className="text-3xl font-bold">{formatCurrency(costRate, primaryCurrency)}</div>
            <p className="text-sm text-muted-foreground">per hour</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Monthly Costs</p>
              <p className="text-lg font-semibold">{formatCurrency(totalCosts, primaryCurrency)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Monthly Hours</p>
              <p className="text-lg font-semibold">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Active Team Members</p>
              <p className="text-lg font-semibold">{activeMembers}</p>
            </div>
          </div>

          {/* Currency Information */}
          {currenciesUsed.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Monedas Utilizadas</p>
                <Badge variant="secondary">{currenciesUsed.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {currenciesUsed.map((currency) => (
                  <div key={currency.code} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-muted-foreground">
                        ({currency.count} {currency.count === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(currency.total_amount, currency.code)}</div>
                      {currency.code !== primaryCurrency && (
                        <div className="text-xs text-muted-foreground">
                          1 {currency.code} = {currency.exchange_rate_to_primary.toFixed(4)} {primaryCurrency}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {exchangeRatesDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="h-3 w-3" />
                  <span>Cotizaciones del {formatDate(exchangeRatesDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

