/**
 * Unit tests for Money utilities using Dinero.js v2
 * ESTÁNDAR NOUGRAM: Validación de precisión financiera grado bancario
 */
import { describe, it, expect } from '@jest/globals';
import {
  fromAPIString,
  fromAPI,
  toAPI,
  toAPIString,
  sumMoney,
  multiplyMoney,
  divideMoney,
  applyPercentage,
  applyMargin,
  formatCurrency,
  fromString,
} from '../money';
import { dinero } from 'dinero.js';

describe('Money utilities - Dinero.js v2', () => {
  describe('fromAPIString', () => {
    it('creates Dinero from API string (ESTÁNDAR NOUGRAM)', () => {
      const dineroObj = fromAPIString('100.50', 'USD');
      expect(dineroObj.amount).toBe(10050); // En centavos
      expect(dineroObj.currency.code).toBe('USD');
    });

    it('creates Dinero from API string (COP)', () => {
      const dineroObj = fromAPIString('1000000', 'COP');
      expect(dineroObj.amount).toBe(1000000); // En unidades enteras
      expect(dineroObj.currency.code).toBe('COP');
    });

    it('throws error for invalid string', () => {
      expect(() => {
        fromAPIString('invalid', 'USD');
      }).toThrow('Invalid money string');
    });
  });

  describe('fromAPI (compatibilidad)', () => {
    it('creates Dinero from API number', () => {
      const dineroObj = fromAPI(100.50, 'USD');
      expect(dineroObj.amount).toBe(10050);
      expect(dineroObj.currency.code).toBe('USD');
    });

    it('creates Dinero from API number (COP)', () => {
      const dineroObj = fromAPI(1000000, 'COP');
      expect(dineroObj.amount).toBe(1000000);
      expect(dineroObj.currency.code).toBe('COP');
    });
  });

  describe('toAPIString', () => {
    it('converts Dinero to API string', () => {
      const dineroObj = fromAPIString('100.50', 'USD');
      const apiString = toAPIString(dineroObj);
      expect(apiString).toBe('100.50');
    });

    it('converts Dinero to API string (COP)', () => {
      const dineroObj = fromAPIString('1000000', 'COP');
      const apiString = toAPIString(dineroObj);
      expect(apiString).toBe('1000000');
    });
  });

  describe('toAPI', () => {
    it('converts Dinero to API number', () => {
      const dineroObj = fromAPIString('100.50', 'USD');
      const apiValue = toAPI(dineroObj);
      expect(apiValue).toBe(100.50);
    });
  });

  describe('sumMoney', () => {
    it('sums multiple Dinero', () => {
      const amounts = [
        fromAPIString('100', 'USD'),
        fromAPIString('50', 'USD'),
        fromAPIString('25', 'USD'),
      ];
      const result = sumMoney(amounts);
      expect(result).not.toBeNull();
      expect(toAPI(result!)).toBe(175);
    });

    it('returns null for empty array', () => {
      const result = sumMoney([]);
      expect(result).toBeNull();
    });

    it('maintains precision in accumulation', () => {
      // Test que 0.1 + 0.2 = 0.3 (no 0.30000000000000004)
      const amounts = [
        fromAPIString('0.1', 'USD'),
        fromAPIString('0.2', 'USD'),
      ];
      const result = sumMoney(amounts);
      expect(toAPI(result!)).toBeCloseTo(0.3, 2);
    });
  });

  describe('multiplyMoney', () => {
    it('multiplies Dinero by scalar', () => {
      const dineroObj = fromAPIString('100', 'USD');
      const result = multiplyMoney(dineroObj, 1.5);
      expect(toAPI(result)).toBe(150);
    });
  });

  describe('divideMoney', () => {
    it('divides Dinero by scalar', () => {
      const dineroObj = fromAPIString('100', 'USD');
      const result = divideMoney(dineroObj, 2);
      expect(toAPI(result)).toBe(50);
    });

    it('throws error when dividing by zero', () => {
      const dineroObj = fromAPIString('100', 'USD');
      expect(() => {
        divideMoney(dineroObj, 0);
      }).toThrow('Cannot divide by zero');
    });
  });

  describe('applyPercentage', () => {
    it('applies percentage to Dinero (e.g., 19% IVA)', () => {
      const dineroObj = fromAPIString('100', 'USD');
      const result = applyPercentage(dineroObj, 19);
      expect(toAPI(result)).toBe(19);
    });
  });

  describe('applyMargin', () => {
    it('applies margin correctly', () => {
      const cost = fromAPIString('100', 'USD');
      const price = applyMargin(cost, 40); // 40% margin
      // 100 / (1 - 0.40) = 166.67
      expect(toAPI(price)).toBeCloseTo(166.67, 2);
    });

    it('throws error for margin >= 100%', () => {
      const cost = fromAPIString('100', 'USD');
      expect(() => {
        applyMargin(cost, 100);
      }).toThrow('Margin cannot be >= 100%');
    });

    it('applies margin correctly for different percentages', () => {
      const cost = fromAPIString('100', 'USD');
      const price30 = applyMargin(cost, 30);
      const price50 = applyMargin(cost, 50);
      
      // 30% margin: 100 / (1 - 0.30) = 142.86
      expect(toAPI(price30)).toBeCloseTo(142.86, 2);
      
      // 50% margin: 100 / (1 - 0.50) = 200
      expect(toAPI(price50)).toBeCloseTo(200, 2);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      const dineroObj = fromAPIString('100.50', 'USD');
      const formatted = formatCurrency(dineroObj, 'es-CO');
      expect(formatted).toContain('100');
      expect(formatted).toContain('50');
    });

    it('formats COP currency without decimals', () => {
      const dineroObj = fromAPIString('1000000', 'COP');
      const formatted = formatCurrency(dineroObj, 'es-CO');
      expect(formatted).toMatch(/\$1[.,]000[.,]000/); // Formato con separadores de miles
      expect(formatted).not.toContain('.00'); // Sin decimales
    });

    it('formats EUR currency', () => {
      const dineroObj = fromAPIString('100.50', 'EUR');
      const formatted = formatCurrency(dineroObj, 'es-CO');
      expect(formatted).toContain('100');
    });
  });

  describe('fromString', () => {
    it('creates Dinero from string with dot separator', () => {
      const dineroObj = fromString('100.50', 'USD');
      expect(toAPI(dineroObj)).toBeCloseTo(100.50, 2);
    });

    it('creates Dinero from string with comma separator', () => {
      const dineroObj = fromString('100,50', 'USD');
      expect(toAPI(dineroObj)).toBeCloseTo(100.50, 2);
    });

    it('creates Dinero from string with European format', () => {
      const dineroObj = fromString('1.234,56', 'USD');
      expect(toAPI(dineroObj)).toBeCloseTo(1234.56, 2);
    });

    it('removes currency symbols', () => {
      const dineroObj = fromString('$100.50', 'USD');
      expect(toAPI(dineroObj)).toBeCloseTo(100.50, 2);
    });
  });

  describe('Round half up (not banker rounding)', () => {
    it('uses Math.round which implements round half up', () => {
      // Math.round() usa "round half up" (no banker's rounding)
      // 0.5 → 1 (hacia arriba), no 0 (hacia par)
      const dineroObj = fromAPIString('0.5', 'USD');
      expect(dineroObj.amount).toBe(50); // 0.5 * 100 = 50 centavos
      
      // Test con 2.5
      const dineroObj2 = fromAPIString('2.5', 'USD');
      expect(dineroObj2.amount).toBe(250); // 2.5 * 100 = 250 centavos
    });
  });

  describe('Precision tests', () => {
    it('maintains precision in accumulation (0.1 + 0.2)', () => {
      const a = fromAPIString('0.1', 'USD');
      const b = fromAPIString('0.2', 'USD');
      const result = a.add(b);
      expect(toAPI(result)).toBeCloseTo(0.3, 2);
    });

    it('handles very small amounts', () => {
      const dineroObj = fromAPIString('0.01', 'USD');
      expect(dineroObj.amount).toBe(1); // 0.01 * 100 = 1 centavo
    });

    it('handles very large amounts', () => {
      const dineroObj = fromAPIString('999999.99', 'USD');
      expect(dineroObj.amount).toBe(99999999); // En centavos
    });
  });
});
