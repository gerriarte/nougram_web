declare module '@jest/globals' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function test(name: string, fn: () => void | Promise<void>): void
  export const expect: {
    (value: any): {
      toBe(value: any): void
      toEqual(value: any): void
      toThrow(message?: string): void
      toBeCloseTo(value: number, precision?: number): void
      toBeNull(): void
      toBeDefined(): void
      not: {
        toBe(value: any): void
        toEqual(value: any): void
        toContain(item: any): void
        toBeNull(): void
      }
      toContain(item: any): void
      toMatch(pattern: string | RegExp): void
      toBeDefined(): void
    }
  }
}
