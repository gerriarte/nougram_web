"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOnboardingStore } from "@/stores/onboarding-store"
import { calculateBCR, formatCurrency, type SocialChargesConfig } from "@/lib/finance-utils"
import { PieChart } from "@/components/charts/pie-chart"
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react"

interface LiveSummarySidebarProps {
  className?: string
}

/**
 * Live summary sidebar showing real-time BCR calculation during onboarding
 * Updates automatically as user fills in team members, costs, and configuration
 */
export function LiveSummarySidebar({ className }: LiveSummarySidebarProps) {
  const {
    country,
    currency,
    enableSocialCharges,
    profileType,
    monthlyIncomeTarget,
    vacationDays,
    teamMembers,
    taxes,
  } = useOnboardingStore()

  // Build social charges config from store
  const socialChargesConfig: SocialChargesConfig | undefined = useMemo(() => {
    if (!enableSocialCharges || country !== 'COL') {
      return undefined
    }

    const health = taxes.health || 0
    const pension = taxes.pension || 0
    const arl = taxes.arl || 0
    const parafiscales = taxes.parafiscales || 0
    const total = health + pension + arl + parafiscales

    return {
      enable_social_charges: true,
      health_percentage: health,
      pension_percentage: pension,
      arl_percentage: arl,
      parafiscales_percentage: parafiscales,
      total_percentage: total,
    }
  }, [enableSocialCharges, country, taxes])

  // Calculate BCR
  const costBreakdown = useMemo(() => {
    // Convert team members to format expected by calculateBCR
    const membersForCalculation = teamMembers.map(member => ({
      name: member.name,
      role: member.role,
      salary: member.salary,
      billableHours: member.billableHours,
      currency: member.currency || currency,
    }))

    // For now, we don't have fixed costs in the store, so use empty array
    // TODO: Add fixed costs to store if needed
    const fixedCosts: Array<{ amount: number; currency?: string }> = []

    return calculateBCR(
      membersForCalculation,
      fixedCosts,
      socialChargesConfig,
      currency || 'USD'
    )
  }, [teamMembers, socialChargesConfig, currency])

  // Prepare chart data for cost distribution
  const costDistributionData = useMemo(() => {
    if (costBreakdown.totalMonthlyCosts === 0) {
      return []
    }

    const data = []
    
    // Add salary costs
    if (costBreakdown.totalMonthlySalaries > 0) {
      data.push({
        name: 'Salarios',
        value: costBreakdown.totalMonthlySalaries,
      })
    }

    // Add fixed costs (if any)
    const fixedCostsTotal = costBreakdown.totalMonthlyCosts - costBreakdown.totalMonthlySalaries
    if (fixedCostsTotal > 0) {
      data.push({
        name: 'Costos Fijos',
        value: fixedCostsTotal,
      })
    }

    return data
  }, [costBreakdown])

  // Calculate available hours considering vacation days (for freelance profile)
  const availableHoursPerMonth = useMemo(() => {
    if (profileType === 'freelance' && vacationDays) {
      // Assuming 4.33 weeks/month and 40 hours/week
      const totalHoursPerMonth = 4.33 * 40
      const vacationHours = (vacationDays / 365) * (52 * 40) // Annual vacation hours prorated to month
      return totalHoursPerMonth - vacationHours
    }
    return null
  }, [profileType, vacationDays])

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Resumen en Vivo
          </CardTitle>
          <CardDescription>
            Cálculo automático del BCR basado en tu configuración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BCR Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-grey-700">Blended Cost Rate (BCR)</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(costBreakdown.blendedCostRate, currency || 'USD')}
              </span>
            </div>
            <p className="text-xs text-grey-600">
              Costo por hora facturable
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 pt-4 border-t border-grey-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-grey-600">Total Salarios:</span>
              <span className="font-semibold">
                {formatCurrency(costBreakdown.totalMonthlySalaries, currency || 'USD')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-grey-600">Total Costos:</span>
              <span className="font-semibold">
                {formatCurrency(costBreakdown.totalMonthlyCosts, currency || 'USD')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-grey-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Horas Facturables:
              </span>
              <span className="font-semibold">
                {costBreakdown.totalBillableHours.toFixed(1)} hrs/mes
              </span>
            </div>
          </div>

          {/* Social Charges Info */}
          {socialChargesConfig?.enable_social_charges && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900 font-medium">Cargas Sociales:</span>
                <span className="text-blue-700 font-semibold">
                  {socialChargesConfig.total_percentage?.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Aplicado a salarios base
              </p>
            </div>
          )}

          {/* Cost Distribution Chart */}
          {costDistributionData.length > 0 && (
            <div className="pt-4 border-t border-grey-200">
              <h4 className="text-sm font-medium text-grey-700 mb-3">Distribución de Costos</h4>
              <PieChart data={costDistributionData} height={200} />
            </div>
          )}

          {/* Freelance-specific info */}
          {profileType === 'freelance' && monthlyIncomeTarget && availableHoursPerMonth && (
            <div className="pt-4 border-t border-grey-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-grey-600" />
                <span className="text-grey-700 font-medium">Información Freelance</span>
              </div>
              <div className="space-y-1 text-xs text-grey-600 pl-6">
                <div className="flex justify-between">
                  <span>Ingreso Objetivo:</span>
                  <span className="font-semibold">
                    {formatCurrency(monthlyIncomeTarget, currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Disponibles:</span>
                  <span className="font-semibold">
                    {availableHoursPerMonth.toFixed(1)} hrs/mes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifa Necesaria:</span>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(
                      availableHoursPerMonth > 0 
                        ? monthlyIncomeTarget / availableHoursPerMonth 
                        : 0,
                      currency || 'USD'
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning if no data */}
          {teamMembers.length === 0 && profileType === 'company' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Agrega miembros del equipo para ver el cálculo del BCR
              </p>
            </div>
          )}

          {profileType === 'freelance' && !monthlyIncomeTarget && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Completa tu ingreso mensual objetivo para ver proyecciones
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




