"use client"

import { useState } from "react"
import { useGetCurrencySettings, useUpdateCurrencySettings, useGetExchangeRates } from "@/lib/queries"
import { useGetCurrentUser } from "@/lib/queries"
import { canManageSubscription } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, TrendingUp, RefreshCw } from "lucide-react"
import { CURRENCIES, formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CurrencySettingsPage() {
  const { data: currentUser } = useGetCurrentUser()
  const canViewRates = canManageSubscription(currentUser) // owner or super_admin
  const { data, isLoading, error } = useGetCurrencySettings(canViewRates)
  const { data: exchangeRates, isLoading: ratesLoading, refetch: refetchRates } = useGetExchangeRates()
  const updateCurrency = useUpdateCurrencySettings()
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")

  const handleSave = async () => {
    if (selectedCurrency) {
      await updateCurrency.mutateAsync({ primary_currency: selectedCurrency })
      setSelectedCurrency("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-destructive">Error al cargar la configuración de moneda</p>
        </CardContent>
      </Card>
    )
  }

  const currentCurrency = selectedCurrency || data?.primary_currency || "USD"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Moneda</h1>
        <p className="text-muted-foreground mt-2">
          Configura la moneda principal para cálculos de costos y reportes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moneda Principal</CardTitle>
          <CardDescription>
            Todos los costos se normalizarán a esta moneda para los cálculos.
            Los costos individuales y salarios pueden ingresarse en diferentes monedas
            y se convertirán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Seleccionar Moneda Principal
            </label>
            <Select
              value={currentCurrency}
              onValueChange={(value) => setSelectedCurrency(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data && (
            <div className="rounded-md bg-muted p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Configuración Actual</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {data.currency_symbol} {data.primary_currency}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({data.primary_currency === "USD" ? "US Dollar" : 
                      data.primary_currency === "COP" ? "Colombian Peso" :
                      data.primary_currency === "ARS" ? "Argentine Peso" :
                      "Euro"})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedCurrency("")}
              disabled={!selectedCurrency || updateCurrency.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCurrency || currentCurrency === data?.primary_currency || updateCurrency.isPending}
            >
              {updateCurrency.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Card - Only for owner/super_admin */}
      {canViewRates && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cotizaciones del Día
                </CardTitle>
                <CardDescription>
                  Cotizaciones del día respecto al USD (base). Se actualizan diariamente.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRates()}
                disabled={ratesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${ratesLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ratesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : exchangeRates?.rates ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(exchangeRates.rates).map(([currencyCode, rateInfo]: [string, any]) => {
                    const currency = CURRENCIES.find(c => c.code === currencyCode)
                    if (!currency) return null
                    
                    const isPrimary = data?.primary_currency === currencyCode
                    const rate = rateInfo.rate || rateInfo.rate_to_usd || 1
                    
                    return (
                      <div
                        key={currencyCode}
                        className={`rounded-md border p-4 ${isPrimary ? 'border-primary-500 bg-primary-50' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{currency.symbol}</span>
                            <div>
                              <p className="font-semibold">{currency.code}</p>
                              <p className="text-xs text-muted-foreground">{currency.name}</p>
                            </div>
                          </div>
                          {isPrimary && (
                            <Badge variant="default">Principal</Badge>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-1">Tasa de cambio</p>
                          <p className="text-lg font-bold">
                            1 USD = {formatCurrency(rate, currencyCode, false)}
                          </p>
                          {rateInfo.last_updated && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Actualizado: {new Date(rateInfo.last_updated).toLocaleString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {exchangeRates.base_currency && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Moneda base:</strong> {exchangeRates.base_currency} (USD)
                      <br />
                      Las cotizaciones se actualizan automáticamente una vez al día. Puedes actualizarlas manualmente usando el botón de actualizar.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No se pudieron cargar las cotizaciones. Verifica tu conexión a internet o intenta más tarde.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Monedas Soportadas</CardTitle>
          <CardDescription>
            Estas monedas están soportadas para ingresar costos y salarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURRENCIES.map((currency) => (
              <div
                key={currency.code}
                className="rounded-md border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">{currency.symbol}</span>
                  <div>
                    <p className="font-semibold">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <p>Formato: {currency.thousandsSeparator} para miles</p>
                  <p>Decimales: {currency.decimalPlaces}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

