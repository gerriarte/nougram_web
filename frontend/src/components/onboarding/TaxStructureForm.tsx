"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { ColombiaTaxBreakdown } from './ColombiaTaxBreakdown'

const taxSchema = z.object({
  iva: z.number().min(0).max(100).optional(),
  ica: z.number().min(0).max(100).optional(),
  retentions: z.number().min(0).max(100).optional(),
})

type TaxFormData = z.infer<typeof taxSchema>

interface TaxStructureFormProps {
  country: string
  enableSocialCharges: boolean
}

export function TaxStructureForm({ country, enableSocialCharges }: TaxStructureFormProps) {
  const { taxes, setTaxes } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      iva: taxes.iva || 0,
      ica: taxes.ica || 0,
      retentions: taxes.retentions || 0,
    },
  })

  const ivaValue = watch('iva') || 0
  const icaValue = watch('ica') || 0
  const retentionsValue = watch('retentions') || 0

  const handleChange = (field: keyof TaxFormData, value: number) => {
    setValue(field, value)
    setTaxes({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-grey-900">Estructura Tributaria</CardTitle>
          <CardDescription className="text-grey-600">
            Configura los impuestos y cargas que aplican a tu organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="iva" className="text-grey-700 font-medium">
                IVA (%)
              </Label>
              <Input
                id="iva"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={ivaValue}
                onChange={(e) => handleChange('iva', parseFloat(e.target.value) || 0)}
                className="h-10 bg-white border-grey-300"
              />
              {errors.iva && (
                <p className="text-sm text-red-600">{errors.iva.message}</p>
              )}
              <p className="text-xs text-grey-600">
                Impuesto al Valor Agregado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ica" className="text-grey-700 font-medium">
                ICA (%)
              </Label>
              <Input
                id="ica"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={icaValue}
                onChange={(e) => handleChange('ica', parseFloat(e.target.value) || 0)}
                className="h-10 bg-white border-grey-300"
              />
              {errors.ica && (
                <p className="text-sm text-red-600">{errors.ica.message}</p>
              )}
              <p className="text-xs text-grey-600">
                Impuesto de Industria y Comercio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentions" className="text-grey-700 font-medium">
                Retenciones (%)
              </Label>
              <Input
                id="retentions"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={retentionsValue}
                onChange={(e) => handleChange('retentions', parseFloat(e.target.value) || 0)}
                className="h-10 bg-white border-grey-300"
              />
              {errors.retentions && (
                <p className="text-sm text-red-600">{errors.retentions.message}</p>
              )}
              <p className="text-xs text-grey-600">
                Retención en la fuente
              </p>
            </div>
          </div>

          {/* Desglose Colombia - Solo si país es Colombia y cargas sociales están habilitadas */}
          {country === 'COL' && enableSocialCharges && (
            <div className="mt-6 pt-6 border-t border-grey-200">
              <ColombiaTaxBreakdown />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

