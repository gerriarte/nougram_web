/**
 * Financial calculation utilities for frontend
 * Used for real-time BCR calculations and financial projections
 * ESTÁNDAR NOUGRAM: Usa dinero.js para precisión grado bancario
 */
import { fromAPI, sumMoney, divideMoney, multiplyMoney, toAPI, formatCurrency as formatDinero } from './money';
import type { Dinero } from 'dinero.js';

export interface TeamMember {
  name: string
  role: string
  salary: number
  billableHours: number
  currency?: string
}

export interface SocialChargesConfig {
  enable_social_charges: boolean
  health_percentage?: number
  pension_percentage?: number
  arl_percentage?: number
  parafiscales_percentage?: number
  total_percentage?: number
}

export interface CostBreakdown {
  totalMonthlySalaries: number
  totalMonthlyCosts: number
  totalBillableHours: number
  blendedCostRate: number
  salaryBreakdown: Array<{
    name: string
    salary: number
    salaryWithCharges: number
    billableHours: number
  }>
}

/**
 * Calculate Blended Cost Rate (BCR) from team members and fixed costs
 * ESTÁNDAR NOUGRAM: Usa dinero.js para precisión grado bancario
 * 
 * Formula:
 * - Real Cost per Resource = Salary + (Salary * SocialCharges%)
 * - Total Monthly Costs = Sum(Real Costs) + Fixed Costs
 * - BCR = Total Monthly Costs / Total Billable Hours
 * 
 * @param teamMembers - Array of team members with salary and billable hours
 * @param fixedCosts - Array of fixed monthly costs
 * @param socialChargesConfig - Social charges configuration (optional)
 * @param currency - Primary currency for calculations
 * @returns Cost breakdown including BCR
 */
export function calculateBCR(
  teamMembers: TeamMember[],
  fixedCosts: Array<{ amount: number; currency?: string }> = [],
  socialChargesConfig?: SocialChargesConfig,
  currency: string = "USD"
): CostBreakdown {
  // Calculate social charges multiplier
  let socialChargesMultiplier = 1.0
  if (socialChargesConfig?.enable_social_charges) {
    const totalPercentage = socialChargesConfig.total_percentage || 
      (socialChargesConfig.health_percentage || 0) +
      (socialChargesConfig.pension_percentage || 0) +
      (socialChargesConfig.arl_percentage || 0) +
      (socialChargesConfig.parafiscales_percentage || 0)
    socialChargesMultiplier = 1.0 + (totalPercentage / 100.0)
  }

  // ESTÁNDAR NOUGRAM: Calcular salarios con cargas sociales usando Dinero
  const salaryAmounts: Dinero[] = teamMembers.map(member => {
    const salary = fromAPI(member.salary, member.currency || currency)
    const salaryWithCharges = multiplyMoney(salary, socialChargesMultiplier)
    return salaryWithCharges
  })

  // ESTÁNDAR NOUGRAM: Calcular costos fijos usando Dinero
  const fixedCostAmounts: Dinero[] = fixedCosts.map(cost => {
    return fromAPI(cost.amount, cost.currency || currency)
  })

  // ESTÁNDAR NOUGRAM: Sumar todos los costos usando Dinero
  const allCosts = [...salaryAmounts, ...fixedCostAmounts]
  const totalMonthlyCostsMoney = sumMoney(allCosts) || fromAPI(0, currency)
  const totalMonthlySalariesMoney = sumMoney(salaryAmounts) || fromAPI(0, currency)

  // Calculate total billable hours per month (assuming 4.33 weeks per month)
  const totalBillableHours = teamMembers.reduce(
    (sum, member) => sum + (member.billableHours * 4.33),
    0
  )

  // ESTÁNDAR NOUGRAM: Calcular BCR usando Dinero
  let blendedCostRate = 0
  if (totalBillableHours > 0) {
    const bcrMoney = divideMoney(totalMonthlyCostsMoney, totalBillableHours)
    blendedCostRate = toAPI(bcrMoney)
  }

  // ESTÁNDAR NOUGRAM: Convertir a formato de respuesta (mantener compatibilidad)
  const salaryBreakdown = teamMembers.map(member => {
    const salary = fromAPI(member.salary, member.currency || currency)
    const salaryWithCharges = multiplyMoney(salary, socialChargesMultiplier)
    
    return {
      name: member.name,
      salary: member.salary,
      salaryWithCharges: toAPI(salaryWithCharges),
      billableHours: member.billableHours * 4.33 // Monthly hours (4.33 weeks/month)
    }
  })

  return {
    totalMonthlySalaries: toAPI(totalMonthlySalariesMoney),
    totalMonthlyCosts: toAPI(totalMonthlyCostsMoney),
    totalBillableHours,
    blendedCostRate,
    salaryBreakdown
  }
}

/**
 * Calculate real cost per resource including social charges
 * ESTÁNDAR NOUGRAM: Usa dinero.js para precisión
 */
export function calculateRealCost(
  salary: number,
  socialChargesConfig?: SocialChargesConfig,
  currency: string = "USD"
): number {
  if (!socialChargesConfig?.enable_social_charges) {
    return salary
  }

  const totalPercentage = socialChargesConfig.total_percentage ||
    (socialChargesConfig.health_percentage || 0) +
    (socialChargesConfig.pension_percentage || 0) +
    (socialChargesConfig.arl_percentage || 0) +
    (socialChargesConfig.parafiscales_percentage || 0)

  // ESTÁNDAR NOUGRAM: Usar Dinero para cálculo preciso
  const salaryMoney = fromAPI(salary, currency)
  const multiplier = 1.0 + (totalPercentage / 100.0)
  const realCostMoney = multiplyMoney(salaryMoney, multiplier)
  
  return toAPI(realCostMoney)
}

/**
 * Format currency amount
 * ESTÁNDAR NOUGRAM: Usa dinero.js para formateo preciso
 * @deprecated Usar formatCurrency de money.ts directamente con Dinero
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  // ESTÁNDAR NOUGRAM: Convertir a Dinero y usar formateo preciso
  const dinero = fromAPI(amount, currency)
  return formatDinero(dinero, 'es-CO')
}




