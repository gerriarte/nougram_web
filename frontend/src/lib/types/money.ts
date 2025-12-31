/**
 * TypeScript types for Money handling
 * ESTÁNDAR NOUGRAM: Tipos para trabajar con dinero usando Dinero.js v2
 */
import type { Dinero } from 'dinero.js';

/**
 * Tipo para representar un monto monetario desde el API
 * ESTÁNDAR NOUGRAM: El backend serializa Decimal como string
 */
export interface MoneyAmount {
  /** Monto como string Decimal del backend */
  amount: string;
  /** Código de moneda (USD, COP, EUR, ARS) */
  currency: string;
}

/**
 * Tipo para representar un monto monetario en el frontend
 * ESTÁNDAR NOUGRAM: Usa Dinero<number> para cálculos precisos
 */
export type Money = Dinero<number>;

/**
 * Helper para convertir MoneyAmount del API a Dinero
 * ESTÁNDAR NOUGRAM: Usa fromAPIString para convertir string → Dinero
 */
export function toDinero(money: MoneyAmount): Dinero<number> {
  // Importación dinámica para evitar dependencias circulares
  const { fromAPIString } = require('../money');
  return fromAPIString(money.amount, money.currency);
}

/**
 * Helper para convertir Dinero a MoneyAmount para enviar al API
 * ESTÁNDAR NOUGRAM: Usa toAPIString para convertir Dinero → string
 */
export function fromDinero(dinero: Dinero<number>, currency: string): MoneyAmount {
  // Importación dinámica para evitar dependencias circulares
  const { toAPIString } = require('../money');
  return {
    amount: toAPIString(dinero),
    currency: currency
  };
}

/**
 * Tipo para campos monetarios en schemas de respuesta del API
 * ESTÁNDAR NOUGRAM: Los campos monetarios vienen como strings Decimal
 */
export type MoneyField = string;

/**
 * Tipo para campos de porcentaje en schemas de respuesta del API
 * ESTÁNDAR NOUGRAM: Los porcentajes también vienen como strings Decimal
 */
export type PercentageField = string;
