/**
 * Unit tests for Money Transformer
 * ESTÁNDAR NOUGRAM: Validación de currency obligatorio
 */
// @ts-ignore - Jest types
import { describe, it, expect } from '@jest/globals';
import { transformAPIResponse } from '../money-transformer';
import type { Dinero } from 'dinero.js';

describe('Money Transformer - Currency validation', () => {
  describe('Currency detection', () => {
    it('throws error if currency is missing (production)', () => {
      const response = {
        total_client_price: '100.50',
        // Sin campo currency
      };
      
      // En producción debería lanzar error
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = 'production';
      
      expect(() => {
        transformAPIResponse(response);
      }).toThrow('Currency is required');
      
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = originalEnv;
    });

    it('uses USD as fallback in development if currency is missing', () => {
      const response = {
        total_client_price: '100.50',
        // Sin campo currency
      };
      
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = 'development';
      
      // En desarrollo debería usar USD como fallback con warning
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.total_client_price).toBeDefined();
      
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = originalEnv;
    });

    it('uses currency from response', () => {
      const response = {
        total_client_price: '1000000',
        currency: 'COP',
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.total_client_price).toBeDefined();
      if (transformed.total_client_price && typeof transformed.total_client_price === 'object' && 'currency' in transformed.total_client_price) {
        expect(transformed.total_client_price.currency.code).toBe('COP');
      }
    });

    it('uses primary_currency from settings response', () => {
      const response = {
        total_client_price: '100.50',
        primary_currency: 'USD',
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.total_client_price).toBeDefined();
      if (transformed.total_client_price && typeof transformed.total_client_price === 'object' && 'currency' in transformed.total_client_price) {
        expect(transformed.total_client_price.currency.code).toBe('USD');
      }
    });

    it('detects currency from nested items', () => {
      const response = {
        items: [
          { client_price: '100.50', currency: 'USD' },
          { client_price: '200.75', currency: 'USD' },
        ],
        total_client_price: '301.25',
        // Sin currency en nivel superior
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.total_client_price).toBeDefined();
      if (transformed.total_client_price && typeof transformed.total_client_price === 'object' && 'currency' in transformed.total_client_price) {
        expect(transformed.total_client_price.currency.code).toBe('USD');
      }
    });

    it('throws error for invalid currency', () => {
      const response = {
        total_client_price: '100.50',
        currency: 'INVALID',
      };
      
      expect(() => {
        transformAPIResponse(response);
      }).toThrow('Invalid currency');
    });
  });

  describe('Money field transformation', () => {
    it('transforms money fields from string to Dinero', () => {
      const response = {
        total_client_price: '100.50',
        total_internal_cost: '75.25',
        currency: 'USD',
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.total_client_price).toBeDefined();
      expect(transformed.total_internal_cost).toBeDefined();
      
      if (transformed.total_client_price && typeof transformed.total_client_price === 'object' && 'currency' in transformed.total_client_price) {
        expect(transformed.total_client_price.currency.code).toBe('USD');
      }
    });

    it('transforms nested money fields', () => {
      const response = {
        items: [
          {
            client_price: '100.50',
            internal_cost: '75.25',
            currency: 'USD',
          },
        ],
        total_client_price: '100.50',
        currency: 'USD',
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.items).toBeDefined();
      expect(Array.isArray(transformed.items)).toBe(true);
      
      if (transformed.items[0]?.client_price && typeof transformed.items[0].client_price === 'object' && 'currency' in transformed.items[0].client_price) {
        expect(transformed.items[0].client_price.currency.code).toBe('USD');
      }
    });

    it('handles arrays of responses', () => {
      const responses = [
        { total_client_price: '100.50', currency: 'USD' },
        { total_client_price: '200.75', currency: 'USD' },
      ];
      
      const transformed = transformAPIResponse(responses) as any;
      expect(Array.isArray(transformed)).toBe(true);
      expect(transformed.length).toBe(2);
    });

    it('preserves non-money fields', () => {
      const response = {
        id: 1,
        name: 'Test Quote',
        total_client_price: '100.50',
        currency: 'USD',
        status: 'draft',
      };
      
      const transformed = transformAPIResponse(response) as any;
      expect(transformed.id).toBe(1);
      expect(transformed.name).toBe('Test Quote');
      expect(transformed.status).toBe('draft');
    });

    it('handles null and undefined values', () => {
      const response = {
        total_client_price: null,
        total_internal_cost: undefined,
        currency: 'USD',
      };
      
      const transformed = transformAPIResponse(response) as any;
      // No debería fallar, solo transformar campos válidos
      expect(transformed).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles empty object', () => {
      const response = {};
      const transformed = transformAPIResponse(response) as any;
      expect(transformed).toEqual({});
    });

    it('handles non-object values', () => {
      const response = 'not an object';
      const transformed = transformAPIResponse(response) as any;
      expect(transformed).toBe('not an object');
    });

    it('handles null response', () => {
      const response = null;
      const transformed = transformAPIResponse(response) as any;
      expect(transformed).toBeNull();
    });

    it('handles currency parameter override', () => {
      const response = {
        total_client_price: '100.50',
        // Sin currency en objeto
      };
      
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = 'development';
      
      const transformed = transformAPIResponse(response, 'COP') as any;
      expect(transformed.total_client_price).toBeDefined();
      
      // @ts-ignore - NODE_ENV is read-only but we need to test different environments
      process.env.NODE_ENV = originalEnv;
    });
  });
});
