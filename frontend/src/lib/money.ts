/**
 * Money handling utilities using dinero.js v2 for precision
 * ESTÁNDAR NOUGRAM: Sintaxis correcta de Dinero.js v2
 * 
 * IMPORTANTE: Dinero.js v2 usa:
 * - `dinero()` (minúscula) en lugar de `Dinero()`
 * - Importar monedas desde `@dinero.js/currencies`
 * - Tipo `Dinero<number>` en lugar de `Dinero.Dinero`
 */
import { dinero, add, multiply, type Dinero } from 'dinero.js';
import { USD, COP, EUR, ARS } from '@dinero.js/currencies';

// Configuración de monedas con objetos de Dinero.js v2
export const CURRENCY_CONFIG: Record<string, {
  currency: typeof USD;
  precision: number;
}> = {
  USD: { currency: USD, precision: USD.exponent },
  COP: { currency: COP, precision: COP.exponent },
  EUR: { currency: EUR, precision: EUR.exponent },
  ARS: { currency: ARS, precision: ARS.exponent },
};

/**
 * ESTÁNDAR NOUGRAM: Crea Dinero desde string Decimal del API
 * El backend serializa Decimal como string para mantener precisión
 * 
 * Ejemplo: "100.50" (USD) → dinero({ amount: 10050, currency: USD })
 * Ejemplo: "1000000" (COP) → dinero({ amount: 1000000, currency: COP })
 * 
 * Redondeo: Usa Math.round() que implementa "round half up" (no banker's rounding)
 * para consistencia con backend que usa ROUND_HALF_UP
 */
export function fromAPIString(
  apiString: string,
  currencyCode: string = 'USD'
): Dinero {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const factor = Math.pow(10, config.precision);
  
  // Parsear string a número con alta precisión
  const numericValue = parseFloat(apiString);
  
  if (isNaN(numericValue)) {
    throw new Error(`Invalid money string: ${apiString}`);
  }
  
  // Convertir a unidades menores (centavos/subunidades)
  // Math.round() usa "round half up" (no banker's rounding)
  const amount = Math.round(numericValue * factor);
  
  // Sintaxis Dinero.js v2: dinero({ amount, currency })
  // @ts-ignore - dinero.js acepta objetos de moneda aunque la declaración dice string
  return dinero({ amount, currency: config.currency });
}

/**
 * Crea Dinero desde número (compatibilidad hacia atrás)
 * @deprecated Usar fromAPIString cuando backend envíe strings
 */
export function fromAPI(
  amount: number,
  currencyCode: string = 'USD'
): Dinero {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const factor = Math.pow(10, config.precision);
  const roundedAmount = Math.round(amount * factor);
  
  // @ts-ignore - dinero.js acepta objetos de moneda aunque la declaración dice string
  return dinero({ amount: roundedAmount, currency: config.currency });
}

/**
 * Convierte Dinero a string para enviar al API
 * ESTÁNDAR NOUGRAM: Backend espera strings Decimal
 */
export function toAPIString(dinero: Dinero): string {
  // Dinero.js v2: usar toJSON() para obtener amount y currency
  const json = dinero.toJSON();
  const amount = json.amount;
  const currencyCode = json.currency.code;
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const factor = Math.pow(10, config.precision);
  const value = amount / factor;
  
  return value.toFixed(config.precision);
}

/**
 * Obtiene el valor numérico de Dinero (para compatibilidad)
 */
export function toAPI(dinero: Dinero): number {
  // Dinero.js v2: usar toJSON() para obtener amount
  const json = dinero.toJSON();
  const amount = json.amount;
  const currencyCode = json.currency.code;
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const factor = Math.pow(10, config.precision);
  
  return amount / factor;
}

/**
 * Suma múltiples Dinero (debe ser misma moneda)
 */
export function sumMoney(amounts: Dinero[]): Dinero | null {
  if (amounts.length === 0) return null;
  
  return amounts.reduce((total, amount) => {
    // Dinero.js v2: usar función add() importada directamente
    return add(total, amount);
  });
}

/**
 * Multiplica Dinero por un escalar
 */
export function multiplyMoney(dineroObj: Dinero, multiplier: number): Dinero {
  // Dinero.js v2: usar toJSON() para obtener amount, luego crear Dinero con multiplicador
  const json = dineroObj.toJSON();
  const newAmount = Math.round(json.amount * multiplier);
  const config = CURRENCY_CONFIG[json.currency.code] || CURRENCY_CONFIG.USD;
  // Crear nuevo Dinero con el amount multiplicado usando dinero()
  return dinero({ amount: newAmount, currency: config.currency });
}

/**
 * Divide Dinero por un escalar
 */
export function divideMoney(dineroObj: Dinero, divisor: number): Dinero {
  if (divisor === 0) {
    throw new Error('Cannot divide by zero');
  }
  // Dinero.js v2: usar toJSON() para obtener amount, luego crear Dinero con divisor
  const json = dineroObj.toJSON();
  const newAmount = Math.round(json.amount / divisor);
  const config = CURRENCY_CONFIG[json.currency.code] || CURRENCY_CONFIG.USD;
  // Crear nuevo Dinero con el amount dividido usando dinero()
  return dinero({ amount: newAmount, currency: config.currency });
}

/**
 * Aplica un porcentaje a Dinero (ej: 19% de IVA)
 */
export function applyPercentage(dineroObj: Dinero, percentage: number): Dinero {
  // Aplicar porcentaje: amount * (percentage / 100)
  const multiplier = percentage / 100;
  return multiplyMoney(dineroObj, multiplier);
}

/**
 * Calcula precio con margen: cost / (1 - margin)
 * ESTÁNDAR NOUGRAM: Usa redondeo "half up" para consistencia con backend
 */
export function applyMargin(
  cost: Dinero,
  marginPercentage: number
): Dinero {
  if (marginPercentage >= 100) {
    throw new Error('Margin cannot be >= 100%');
  }
  
  const marginDecimal = marginPercentage / 100;
  const divisor = 1 - marginDecimal;
  const multiplier = 1 / divisor;
  
  // Dinero.js v2: usar multiplyMoney helper
  return multiplyMoney(cost, multiplier);
}

/**
 * Formatea Dinero usando localización específica
 * ESTÁNDAR NOUGRAM: Usa locale 'es-CO' para formateo explícito
 */
export function formatCurrency(
  dinero: Dinero,
  locale: string = 'es-CO',
  options?: { showSymbol?: boolean }
): string {
  // Dinero.js v2: usar toJSON() para obtener currency y amount
  const json = dinero.toJSON();
  const currency = json.currency.code;
  const showSymbol = options?.showSymbol !== false;
  
  // Formato específico por moneda
  if (currency === 'COP') {
    // COP: sin decimales, punto como separador de miles
    const amount = json.amount; // Ya está en unidades enteras
    const formatted = amount.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return showSymbol ? `$${formatted}` : formatted;
  } else {
    // Otras monedas: con decimales
    const currencyCode = json.currency.code;
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
    const factor = Math.pow(10, config.precision);
    const value = json.amount / factor;
    if (showSymbol) {
      return value.toLocaleString(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return value.toLocaleString(locale, {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }
}

/**
 * Helper para crear Dinero desde string (input de usuario)
 */
export function fromString(value: string, currencyCode: string = 'USD'): Dinero {
  // Remover símbolos y espacios
  const cleanValue = value.replace(/[^\d.,-]/g, '');
  
  // Detectar separador decimal
  const hasComma = cleanValue.includes(',');
  const hasDot = cleanValue.includes('.');
  
  let numericValue: number;
  
  if (hasComma && hasDot) {
    // Formato europeo: 1.234,56
    const parts = cleanValue.split(',');
    numericValue = parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1]);
  } else if (hasComma) {
    // Solo coma: 1234,56
    numericValue = parseFloat(cleanValue.replace(',', '.'));
  } else {
    // Solo punto o sin separador: 1234.56 o 1234
    numericValue = parseFloat(cleanValue);
  }
  
  return fromAPI(numericValue, currencyCode);
}
