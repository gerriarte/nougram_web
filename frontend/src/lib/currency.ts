/**
 * Currency utilities and constants
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  grouping: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    grouping: 3,
  },
  {
    code: "COP",
    symbol: "$",
    name: "Colombian Peso",
    locale: "es-CO",
    decimalPlaces: 0, // COP typically doesn't use decimals
    thousandsSeparator: ".",
    decimalSeparator: ",",
    grouping: 3,
  },
  {
    code: "ARS",
    symbol: "$",
    name: "Argentine Peso",
    locale: "es-AR",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    grouping: 3,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "en-EU",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    grouping: 3,
  },
] as const;

export const SUPPORTED_CURRENCIES = CURRENCIES;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol || "$";
}

export function getCurrencyName(currency: string): string {
  return CURRENCIES.find((c) => c.code === currency)?.name || "US Dollar";
}

export function getCurrencyInfo(currency: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
}

/**
 * Format currency amount with proper thousands/millions grouping
 * Example: COP 1.000.000, USD 1,000,000.00
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  useGrouping: boolean = true
): string {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/currency.ts:79',message:'formatCurrency called',data:{amount,amountType:typeof amount,isNaN:isNaN(amount),currency},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  // Handle NaN and invalid numbers
  if (isNaN(amount) || !isFinite(amount)) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/9259ea1e-d9d4-4580-890f-411d9fb62b18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/currency.ts:85',message:'formatCurrency received NaN or invalid number',data:{amount,amountType:typeof amount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return `${getCurrencyInfo(currency).symbol} 0`;
  }
  
  const currencyInfo = getCurrencyInfo(currency);
  const symbol = currencyInfo.symbol;
  const decimalPlaces = currencyInfo.decimalPlaces;
  const thousandsSep = currencyInfo.thousandsSeparator;
  const decimalSep = currencyInfo.decimalSeparator;
  const grouping = currencyInfo.grouping;

  // Round to appropriate decimal places
  const roundedAmount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

  // Split into integer and decimal parts
  const integerPart = Math.floor(Math.abs(roundedAmount));
  const decimalPart = Math.abs(roundedAmount) - integerPart;

  // Format integer part with grouping
  let integerStr: string;
  if (useGrouping && grouping > 0) {
    const reversedStr = integerPart.toString().split("").reverse().join("");
    const groupedParts: string[] = [];
    for (let i = 0; i < reversedStr.length; i += grouping) {
      groupedParts.push(reversedStr.slice(i, i + grouping));
    }
    integerStr = groupedParts.join(thousandsSep).split("").reverse().join("");
  } else {
    integerStr = integerPart.toString();
  }

  // Format decimal part
  let formattedAmount: string;
  if (decimalPlaces > 0 && decimalPart > 0) {
    const decimalStr = decimalPart.toFixed(decimalPlaces).slice(2); // Remove "0."
    formattedAmount = `${integerStr}${decimalSep}${decimalStr}`;
  } else {
    formattedAmount = integerStr;
  }

  // Add negative sign if needed
  if (roundedAmount < 0) {
    formattedAmount = `-${formattedAmount}`;
  }

  // Add currency symbol
  return `${symbol} ${formattedAmount}`;
}

