"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboardingStore, TaxStructure } from '@/stores/onboarding-store'
import { Info } from 'lucide-react'

/**
 * Colombia-specific tax breakdown for social charges (Ley 100)
 * Shows breakdown of health, pension, ARL, and parafiscales percentages
 */
export function ColombiaTaxBreakdown() {
  const { taxes, setTaxes } = useOnboardingStore()

  // Default percentages for Colombia (Ley 100 + Provisiones Legales)
  const defaultHealth = 8.5
  const defaultPension = 12.0
  const defaultARL = 0.522
  const defaultParafiscales = 4.0 // Solo Cajas (SENA/ICBF exonerados bajo ciertas condiciones)
  const defaultPrima = 8.33
  const defaultCesantias = 8.33
  const defaultIntCesantias = 1.0
  const defaultVacations = 4.17

  const health = taxes.health ?? defaultHealth
  const pension = taxes.pension ?? defaultPension
  const arl = taxes.arl ?? defaultARL
  const parafiscales = taxes.parafiscales ?? defaultParafiscales
  const prima_services = taxes.prima_services ?? defaultPrima
  const cesantias = taxes.cesantias ?? defaultCesantias
  const int_cesantias = taxes.int_cesantias ?? defaultIntCesantias
  const vacations = taxes.vacations ?? defaultVacations

  const totalPercentage = health + pension + arl + parafiscales + prima_services + cesantias + int_cesantias + vacations

  const handleChange = (field: keyof TaxStructure, value: number) => {
    setTaxes({ [field]: value })
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-grey-900">
            Cargas Prestacionales y Provisiones (Colombia)
          </CardTitle>
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <CardDescription className="text-grey-600">
          Configura los porcentajes que se aplicarán al salario para calcular el costo real (~1.51)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="health" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Salud (%)</Label>
            <Input
              id="health"
              type="number"
              step="0.01"
              value={health}
              onChange={(e) => handleChange('health', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pension" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pensión (%)</Label>
            <Input
              id="pension"
              type="number"
              step="0.01"
              value={pension}
              onChange={(e) => handleChange('pension', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARL (%)</Label>
            <Input
              id="arl"
              type="number"
              step="0.001"
              value={arl}
              onChange={(e) => handleChange('arl', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parafiscales" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parafiscales (%)</Label>
            <Input
              id="parafiscales"
              type="number"
              step="0.01"
              value={parafiscales}
              onChange={(e) => handleChange('parafiscales', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prima_services" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prima (%)</Label>
            <Input
              id="prima_services"
              type="number"
              step="0.01"
              value={prima_services}
              onChange={(e) => handleChange('prima_services', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cesantias" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cesantías (%)</Label>
            <Input
              id="cesantias"
              type="number"
              step="0.01"
              value={cesantias}
              onChange={(e) => handleChange('cesantias', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="int_cesantias" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Int. Cesantías (%)</Label>
            <Input
              id="int_cesantias"
              type="number"
              step="0.01"
              value={int_cesantias}
              onChange={(e) => handleChange('int_cesantias', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacations" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vacaciones (%)</Label>
            <Input
              id="vacations"
              type="number"
              step="0.01"
              value={vacations}
              onChange={(e) => handleChange('vacations', parseFloat(e.target.value) || 0)}
              className="h-9 bg-white"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300 flex items-center justify-between">
          <div>
            <span className="font-semibold text-grey-900 block">Total de Factor Multiplicador:</span>
            <p className="text-[10px] text-grey-600">
              Factor real estimado: <span className="font-bold">{(1 + totalPercentage / 100).toFixed(2)}x</span>
            </p>
          </div>
          <span className="text-3xl font-bold text-primary-600">
            {totalPercentage.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

