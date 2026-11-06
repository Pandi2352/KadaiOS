import { scaleDecimal } from './decimal.js';

/** Stock is stored as a whole number of each unit's base: grams, millilitres or single items. */
export const UNITS = {
  kg: { label: 'kg', base: 'g', decimals: 3 },
  g: { label: 'g', base: 'g', decimals: 0 },
  l: { label: 'litre', base: 'ml', decimals: 3 },
  ml: { label: 'ml', base: 'ml', decimals: 0 },
  piece: { label: 'piece', base: 'piece', decimals: 0 },
  packet: { label: 'packet', base: 'packet', decimals: 0 },
  box: { label: 'box', base: 'box', decimals: 0 },
} as const;

export type Unit = keyof typeof UNITS;

export const baseUnitsPerUnit = (unit: Unit): number => 10 ** UNITS[unit].decimals;

/** Rejects quantities finer than the base unit, such as 1.5 boxes or 1.2345 kg. */
export const toBaseQuantity = (value: string | number, unit: Unit): number =>
  scaleDecimal(value, UNITS[unit].decimals, { exact: true });

export const fromBaseQuantity = (baseQuantity: number, unit: Unit): number => baseQuantity / baseUnitsPerUnit(unit);

export const formatQuantity = (baseQuantity: number, unit: Unit): string =>
  `${fromBaseQuantity(baseQuantity, unit)} ${UNITS[unit].label}`;
