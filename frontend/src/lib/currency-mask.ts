/**
 * Currency mask utilities for formatting and parsing currency inputs
 */
import { CURRENCIES, CurrencyInfo } from './currency';

export interface CurrencyMask {
  format: (value: string) => string;
  parse: (value: string) => number;
}

/**
 * Create a currency mask for a specific currency
 */
export function createCurrencyMask(currency: string): CurrencyMask {
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  
  return {
    format: (value: string): string => {
      // Remove everything except numbers
      const numbers = value.replace(/\D/g, '');
      
      if (!numbers) return '';
      
      // Apply format according to currency
      if (currencyInfo.decimalPlaces === 0) {
        // No decimals (COP)
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, currencyInfo.thousandsSeparator);
      } else {
        // With decimals
        const integerPart = numbers.slice(0, -currencyInfo.decimalPlaces);
        const decimalPart = numbers.slice(-currencyInfo.decimalPlaces);
        
        const formattedInteger = integerPart || '0';
        const formattedIntegerWithSeparator = formattedInteger.replace(
          /\B(?=(\d{3})+(?!\d))/g, 
          currencyInfo.thousandsSeparator
        );
        
        return decimalPart 
          ? `${formattedIntegerWithSeparator}${currencyInfo.decimalSeparator}${decimalPart}`
          : formattedIntegerWithSeparator;
      }
    },
    parse: (value: string): number => {
      const numbers = value.replace(/\D/g, '');
      if (!numbers) return 0;
      
      if (currencyInfo.decimalPlaces === 0) {
        return parseInt(numbers, 10);
      } else {
        // For currencies with decimals, divide by 10^decimalPlaces
        return parseFloat(numbers) / Math.pow(10, currencyInfo.decimalPlaces);
      }
    }
  };
}

/**
 * Format a number as currency string for display in input
 */
export function formatCurrencyForInput(amount: number, currency: string): string {
  const mask = createCurrencyMask(currency);
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  
  // Convert to integer representation (multiply by 10^decimalPlaces)
  const integerAmount = Math.round(amount * Math.pow(10, currencyInfo.decimalPlaces));
  
  return mask.format(integerAmount.toString());
}

/**
 * Parse a formatted currency string to number
 */
export function parseCurrencyFromInput(value: string, currency: string): number {
  const mask = createCurrencyMask(currency);
  return mask.parse(value);
}






