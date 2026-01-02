declare module 'dinero.js' {
  export type Dinero = {
    toFormat(format?: string): string
    toUnit(): number
    getAmount(): number
    currency: { code: string; exponent?: number }
    amount: number
    add(other: Dinero): Dinero
    subtract(other: Dinero): Dinero
    multiply(factor: number): Dinero
    divide(divisor: number): Dinero
    equalsTo(other: Dinero): boolean
    lessThan(other: Dinero): boolean
    greaterThan(other: Dinero): boolean
  }

  export interface DineroOptions {
    amount: number
    currency: string | { code: string; exponent?: number }
  }

  export function dinero(options: DineroOptions): Dinero
  export function dinero(amount: number, currency: string | { code: string; exponent?: number }): Dinero
  
  // Default export for compatibility
  const defaultExport: {
    (options: DineroOptions): Dinero
    (amount: number, currency: string | { code: string; exponent?: number }): Dinero
  }
  export default defaultExport
}
