declare module 'dinero.js' {
  export interface Dinero {
    toFormat(format?: string): string
    toUnit(): number
    getAmount(): number
    getCurrency(): { code: string }
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
    currency: string
  }

  export function dinero(options: DineroOptions): Dinero
  export function dinero(amount: number, currency: string): Dinero
}
