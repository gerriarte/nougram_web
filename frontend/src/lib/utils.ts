import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}



