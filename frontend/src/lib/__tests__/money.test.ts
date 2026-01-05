/**
 * Unit tests for money.ts utilities
 * ESTÁNDAR NOUGRAM: Tests de precisión financiera con Dinero.js
 */
import { describe, it, expect } from 'vitest';
import { dinero } from 'dinero.js';
import { USD, COP, EUR } from '@dinero.js/currencies';
import {
  fromAPIString,
  fromAPI,
  toAPIString,
  toAPI,
  sumMoney,
  multiplyMoney,
  divideMoney,
  applyPercentage,
  applyMargin,
  formatCurrency,
  fromString,
} from '../money';

describe('Money Creation', () => {
  describe('fromAPIString', () => {
    it('should create Dinero from USD string', () => {
      const dineroObj = fromAPIString('100.50', 'USD');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(10050); // 100.50 * 100 = 10050 cents
      expect(json.currency.code).toBe('USD');
    });

    it('should create Dinero from COP string (no decimals)', () => {
      // COP has exponent 2, so "1000000" → 1000000 * 100 = 100000000 amount
      const dineroObj = fromAPIString('1000000', 'COP');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(100000000); // 1000000 * 100 (exponent 2)
      expect(json.currency.code).toBe('COP');
    });

    it('should handle zero', () => {
      const dineroObj = fromAPIString('0', 'USD');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(0);
    });

    it('should throw error for invalid string', () => {
      expect(() => fromAPIString('invalid', 'USD')).toThrow('Invalid money string');
    });
  });

  describe('fromAPI', () => {
    it('should create Dinero from number', () => {
      const dineroObj = fromAPI(100.50, 'USD');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(10050);
      expect(json.currency.code).toBe('USD');
    });

    it('should round correctly (round half up)', () => {
      const dineroObj = fromAPI(100.555, 'USD');
      // Math.round uses round half up, so 100.555 * 100 = 10055.5 → 10056
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(10056);
    });
  });
});

describe('Money Conversions', () => {
  describe('toAPIString', () => {
    it('should convert USD Dinero to string', () => {
      const dineroObj = dinero({ amount: 10050, currency: USD });
      const result = toAPIString(dineroObj);
      expect(result).toBe('100.50');
    });

    it('should convert COP Dinero to string', () => {
      // COP has exponent 2, so 1000000 amount = 10000 units
      const dineroObj = dinero({ amount: 1000000, currency: COP });
      const result = toAPIString(dineroObj);
      expect(result).toBe('10000.00'); // 1000000 / 100 = 10000.00
    });
  });

  describe('toAPI', () => {
    it('should convert Dinero to number', () => {
      const dineroObj = dinero({ amount: 10050, currency: USD });
      const result = toAPI(dineroObj);
      expect(result).toBe(100.50);
    });
  });
});

describe('Money Operations', () => {
  describe('sumMoney', () => {
    it('should sum multiple Dinero objects', () => {
      const amounts = [
        dinero({ amount: 10000, currency: USD }),
        dinero({ amount: 5000, currency: USD }),
        dinero({ amount: 2500, currency: USD }),
      ];
      const result = sumMoney(amounts);
      expect(result).not.toBeNull();
      const resultJSON = result!.toJSON();
      expect(resultJSON.amount).toBe(17500);
      expect(resultJSON.currency.code).toBe('USD');
    });

    it('should return null for empty array', () => {
      const result = sumMoney([]);
      expect(result).toBeNull();
    });

    it('should handle single amount', () => {
      const amounts = [dinero({ amount: 10000, currency: USD })];
      const result = sumMoney(amounts);
      const resultJSON = result!.toJSON();
      expect(resultJSON.amount).toBe(10000);
    });
  });

  describe('multiplyMoney', () => {
    it('should multiply Dinero by scalar', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD });
      const result = multiplyMoney(dineroObj, 1.5);
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBe(15000);
    });
  });

  describe('divideMoney', () => {
    it('should divide Dinero by scalar', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD });
      const result = divideMoney(dineroObj, 2);
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBe(5000);
    });

    it('should throw error when dividing by zero', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD });
      expect(() => divideMoney(dineroObj, 0)).toThrow('Cannot divide by zero');
    });
  });

  describe('applyPercentage', () => {
    it('should apply percentage (e.g., 19% tax)', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD }); // $100.00
      const result = applyPercentage(dineroObj, 19);
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBe(1900); // $19.00
    });

    it('should handle zero percentage', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD });
      const result = applyPercentage(dineroObj, 0);
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBe(0);
    });
  });

  describe('applyMargin', () => {
    it('should apply margin correctly', () => {
      // Cost = $100, margin = 40% → price = $100 / (1 - 0.40) = $166.67
      const cost = dinero({ amount: 10000, currency: USD }); // $100.00
      const result = applyMargin(cost, 40);
      // Should be approximately $166.67 = 16667 cents
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBeGreaterThan(16666);
      expect(resultJSON.amount).toBeLessThan(16668);
    });

    it('should throw error for margin >= 100%', () => {
      const dineroObj = dinero({ amount: 10000, currency: USD });
      expect(() => applyMargin(dineroObj, 100)).toThrow('Margin cannot be >= 100%');
      expect(() => applyMargin(dineroObj, 150)).toThrow('Margin cannot be >= 100%');
    });
  });
});

describe('Money Formatting', () => {
  describe('formatCurrency', () => {
    it('should format USD with decimals', () => {
      const dineroObj = dinero({ amount: 10050, currency: USD }); // $100.50
      const result = formatCurrency(dineroObj);
      expect(result).toContain('100');
      expect(result).toContain('50');
    });

    it('should format COP without decimals', () => {
      const dineroObj = dinero({ amount: 1000000, currency: COP });
      const result = formatCurrency(dineroObj);
      // COP should not show decimals
      expect(result).toContain('1.000.000');
      expect(result).not.toContain(',00');
    });

    it('should format EUR with decimals', () => {
      const dineroObj = dinero({ amount: 10050, currency: EUR }); // €100.50
      const result = formatCurrency(dineroObj);
      expect(result).toContain('100');
    });

    it('should hide symbol when requested', () => {
      const dineroObj = dinero({ amount: 10050, currency: USD });
      const result = formatCurrency(dineroObj, 'es-CO', { showSymbol: false });
      expect(result).not.toContain('$');
    });
  });
});

describe('Money Parsing', () => {
  describe('fromString', () => {
    it('should parse USD format (dot as decimal)', () => {
      const result = fromString('100.50', 'USD');
      const resultJSON = result.toJSON();
      expect(resultJSON.amount).toBe(10050);
      expect(resultJSON.currency.code).toBe('USD');
    });

    it('should parse European format (comma as decimal)', () => {
      const result = fromString('100,50', 'USD');
      const json = result.toJSON();
      expect(json.amount).toBe(10050);
    });

    it('should parse format with thousands separator', () => {
      const result = fromString('1.234,56', 'USD');
      const json = result.toJSON();
      expect(json.amount).toBe(123456);
    });

    it('should handle currency symbols', () => {
      const result = fromString('$100.50', 'USD');
      const json = result.toJSON();
      expect(json.amount).toBe(10050);
    });

    it('should handle spaces', () => {
      const result = fromString('$ 100.50', 'USD');
      const json = result.toJSON();
      expect(json.amount).toBe(10050);
    });
  });
});

describe('Money Precision', () => {
  it('should maintain precision in calculations', () => {
    // 0.1 + 0.2 should equal 0.3, not 0.30000000000000004
    const money1 = fromAPI(0.1, 'USD');
    const money2 = fromAPI(0.2, 'USD');
    const result = sumMoney([money1, money2]);
      const resultJSON = result!.toJSON();
      expect(resultJSON.amount).toBe(30); // 0.3 * 100 = 30 cents
  });

  it('should handle large numbers', () => {
    const dineroObj = fromAPIString('999999999.99', 'USD');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(99999999999);
  });

  it('should handle very small numbers', () => {
    const dineroObj = fromAPI(0.01, 'USD');
      const json = dineroObj.toJSON();
      expect(json.amount).toBe(1); // 0.01 * 100 = 1 cent
  });
});
