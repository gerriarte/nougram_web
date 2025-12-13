/**
 * Currency utilities and constants
 */

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "COP", symbol: "$", name: "Colombian Peso", locale: "es-CO" },
  { code: "ARS", symbol: "$", name: "Argentine Peso", locale: "es-AR" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "en-EU" },
] as const;

export const SUPPORTED_CURRENCIES = CURRENCIES;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol || "$";
}

export function getCurrencyName(currency: string): string {
  return CURRENCIES.find((c) => c.code === currency)?.name || "US Dollar";
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatted = new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

