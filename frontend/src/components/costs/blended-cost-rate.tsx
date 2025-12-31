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
  const totalFixedOverhead = data?.total_fixed_overhead || 0
  const totalToolsCosts = data?.total_tools_costs || 0
  const totalSalaries = data?.total_salaries || 0
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
            <CardDescription>Costo por hora de la agencia</CardDescription>
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
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4" />
                    Desglose Legal Colombia (~1.51)
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Siguiendo la normativa colombiana, por cada $1 de salario base, la agencia tiene un costo real de ~$1.51.
                    Este cálculo incluye:
                  </p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px] text-blue-800 dark:text-blue-200">
                    <li>• Salud (8.5%) & Pensión (12%)</li>
                    <li>• ARL (Riesgo I-V) & Caja (4%)</li>
                    <li>• Prima de Servicios (8.33%)</li>
                    <li>• Cesantías (8.33%) & Int. (1%)</li>
                    <li>• Vacaciones (4.17%)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Fórmula Principal</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    BCR = (Nómina Real + Overhead) / Total Horas Facturables
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Categorías de Costos</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <p className="font-medium text-sm">1. Recursos (Nómina Real)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Salarios mensuales de miembros activos del equipo multiplicados por la carga prestacional configurada.
                      </p>
                    </div>

                    <div className="border-l-4 border-emerald-500 pl-4">
                      <p className="font-medium text-sm">2. Infraestructura (Overhead)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Costos de "persiana abierta": Arriendo, servicios públicos, contabilidad, marketing y administración.
                      </p>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                      <p className="font-medium text-sm">3. Herramientas (SaaS/Software)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Suscripciones generales (Slack, Office) y de especialidad (Adobe, AWS, Figma).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Datos Actuales Utilizados</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Costo Total Operativo:</span>
                      <span className="font-semibold">{formatCurrency(totalCosts, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between pl-4 text-xs border-l-2 border-indigo-500">
                      <span className="text-muted-foreground">Recursos (Nómina Real):</span>
                      <span>{formatCurrency(totalSalaries, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between pl-4 text-xs border-l-2 border-emerald-500">
                      <span className="text-muted-foreground">Infraestructura (Overhead):</span>
                      <span>{formatCurrency(totalFixedOverhead, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between pl-4 text-xs border-l-2 border-amber-500">
                      <span className="text-muted-foreground">Herramientas (SaaS):</span>
                      <span>{formatCurrency(totalToolsCosts, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="text-muted-foreground">Capacidad Mensual (Hrs):</span>
                      <span className="font-semibold">{totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipo Activo:</span>
                      <span className="font-semibold">{activeMembers}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Nota:</strong> Este cálculo se actualiza automáticamente cuando agregas costos con categorías como "Software" o "SaaS", o cuando ajustas la carga prestacional en la configuración de la organización.
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
            <div className="text-4xl font-bold text-primary">{formatCurrency(costRate, primaryCurrency)}</div>
            <p className="text-sm text-muted-foreground">por hora operativa (BCR)</p>
          </div>

          {/* Detailed Breakdown Grid */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resumen Mensual</h4>

            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                <p className="text-sm text-muted-foreground">Recursos (Nómina)</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(totalSalaries, primaryCurrency)}</p>
            </div>

            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                <p className="text-sm text-muted-foreground">Infraestructura</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(totalFixedOverhead, primaryCurrency)}</p>
            </div>

            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                <p className="text-sm text-muted-foreground">Herramientas</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(totalToolsCosts, primaryCurrency)}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t font-bold">
              <p className="text-sm">Gasto Operativo Total</p>
              <p className="text-base">{formatCurrency(totalCosts, primaryCurrency)}</p>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
              <p>Capacidad Real</p>
              <p className="font-medium text-foreground">{totalHours.toFixed(1)}h / mes</p>
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

