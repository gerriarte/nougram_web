/**
 * Hook para obtener y usar la moneda primaria de la organización
 * Esta moneda se establece en el onboarding y solo puede cambiarse desde Settings > Currency
 */
import { useGetCurrencySettings } from '@/lib/queries'

/**
 * Hook para obtener la moneda primaria de la organización
 * @returns La moneda primaria (default: 'USD' si no está configurada)
 */
export function usePrimaryCurrency(): string {
  const { data } = useGetCurrencySettings(false)
  return data?.primary_currency || 'USD'
}

/**
 * Hook para obtener la moneda primaria con información completa
 * @returns Objeto con la moneda primaria y símbolo
 */
export function usePrimaryCurrencyInfo() {
  const { data } = useGetCurrencySettings(false)
  return {
    currency: data?.primary_currency || 'USD',
    symbol: data?.currency_symbol || '$',
  }
}

