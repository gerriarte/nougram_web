"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { Info } from 'lucide-react'

/**
 * Colombia-specific tax breakdown for social charges (Ley 100)
 * Shows breakdown of health, pension, ARL, and parafiscales percentages
 */
export function ColombiaTaxBreakdown() {
  const { taxes, setTaxes } = useOnboardingStore()

  // Default percentages for Colombia (Ley 100)
  const defaultHealth = 8.5
  const defaultPension = 12.0
  const defaultARL = 0.522 // Variable según riesgo, este es un promedio
  const defaultParafiscales = 8.0 // SENA (2%) + ICBF (3%) + Cajas de Compensación (~3%)

  const health = taxes.health ?? defaultHealth
  const pension = taxes.pension ?? defaultPension
  const arl = taxes.arl ?? defaultARL
  const parafiscales = taxes.parafiscales ?? defaultParafiscales

  const totalPercentage = health + pension + arl + parafiscales

  const handleChange = (field: 'health' | 'pension' | 'arl' | 'parafiscales', value: number) => {
    setTaxes({ [field]: value })
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-grey-900">
            Desglose de Cargas Prestacionales (Ley 100)
          </CardTitle>
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <CardDescription className="text-grey-600">
          Configura los porcentajes de cargas prestacionales que se aplicarán al salario base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="health" className="text-grey-700 font-medium">
              Salud (%)
            </Label>
            <Input
              id="health"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={health}
              onChange={(e) => handleChange('health', parseFloat(e.target.value) || 0)}
              className="h-10 bg-white border-grey-300"
            />
            <p className="text-xs text-grey-600">
              Porcentaje de salud (EPS)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pension" className="text-grey-700 font-medium">
              Pensión (%)
            </Label>
            <Input
              id="pension"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={pension}
              onChange={(e) => handleChange('pension', parseFloat(e.target.value) || 0)}
              className="h-10 bg-white border-grey-300"
            />
            <p className="text-xs text-grey-600">
              Porcentaje de pensión
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arl" className="text-grey-700 font-medium">
              ARL (%)
            </Label>
            <Input
              id="arl"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={arl}
              onChange={(e) => handleChange('arl', parseFloat(e.target.value) || 0)}
              className="h-10 bg-white border-grey-300"
            />
            <p className="text-xs text-grey-600">
              Riesgos Laborales (variable según nivel de riesgo)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parafiscales" className="text-grey-700 font-medium">
              Parafiscales (%)
            </Label>
            <Input
              id="parafiscales"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={parafiscales}
              onChange={(e) => handleChange('parafiscales', parseFloat(e.target.value) || 0)}
              className="h-10 bg-white border-grey-300"
            />
            <p className="text-xs text-grey-600">
              SENA (2%) + ICBF (3%) + Cajas de Compensación (~3%)
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-grey-900">Total de Cargas Prestacionales:</span>
            <span className="text-2xl font-bold text-primary-600">
              {totalPercentage.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-grey-600 mt-2">
            Este porcentaje se aplicará al salario base de cada empleado para calcular el costo real del recurso
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

