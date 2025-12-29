/**
 * Financial calculation utilities for frontend
 * Used for real-time BCR calculations and financial projections
 */

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

  // Calculate total monthly salaries with social charges
  let totalMonthlySalaries = 0.0
  const salaryBreakdown = teamMembers.map(member => {
    const salaryWithCharges = member.salary * socialChargesMultiplier
    totalMonthlySalaries += salaryWithCharges
    
    return {
      name: member.name,
      salary: member.salary,
      salaryWithCharges,
      billableHours: member.billableHours * 4.33 // Monthly hours (4.33 weeks/month)
    }
  })

  // Calculate total fixed costs (simplified - assumes same currency for now)
  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0)

  // Calculate total monthly costs
  const totalMonthlyCosts = totalMonthlySalaries + totalFixedCosts

  // Calculate total billable hours per month (assuming 4.33 weeks per month)
  const totalBillableHours = teamMembers.reduce(
    (sum, member) => sum + (member.billableHours * 4.33),
    0
  )

  // Calculate BCR
  const blendedCostRate = totalBillableHours > 0 
    ? totalMonthlyCosts / totalBillableHours 
    : 0

  return {
    totalMonthlySalaries,
    totalMonthlyCosts,
    totalBillableHours,
    blendedCostRate,
    salaryBreakdown
  }
}

/**
 * Calculate real cost per resource including social charges
 */
export function calculateRealCost(
  salary: number,
  socialChargesConfig?: SocialChargesConfig
): number {
  if (!socialChargesConfig?.enable_social_charges) {
    return salary
  }

  const totalPercentage = socialChargesConfig.total_percentage ||
    (socialChargesConfig.health_percentage || 0) +
    (socialChargesConfig.pension_percentage || 0) +
    (socialChargesConfig.arl_percentage || 0) +
    (socialChargesConfig.parafiscales_percentage || 0)

  return salary * (1.0 + (totalPercentage / 100.0))
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  })
  return formatter.format(amount)
}

