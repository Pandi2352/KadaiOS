import { describe, expect, it } from 'vitest';
import { baseUnitsPerUnit, formatQuantity, fromBaseQuantity, toBaseQuantity } from './quantity.js';

describe('toBaseQuantity', () => {
  it.each([
    ['1.5', 'kg', 1500],
    [1.1, 'kg', 1100],
    ['250', 'g', 250],
    ['0.5', 'l', 500],
    ['3', 'box', 3],
  ] as const)('converts %s %s to %s', (value, unit, expected) => {
    expect(toBaseQuantity(value, unit)).toBe(expected);
  });

  it('rejects fractions of indivisible units', () => {
    expect(() => toBaseQuantity('1.5', 'box')).toThrow(RangeError);
  });

  it('rejects precision finer than a gram', () => {
    expect(() => toBaseQuantity('1.2345', 'kg')).toThrow(RangeError);
  });

  it('allows trailing zeros', () => {
    expect(toBaseQuantity('2.000', 'piece')).toBe(2);
  });
});

describe('stock example from the plan', () => {
  it('leaves exactly 48.5 kg after selling 1.5 kg from 50 kg', () => {
    const remaining = toBaseQuantity('50', 'kg') - toBaseQuantity('1.5', 'kg');
    expect(remaining).toBe(48500);
    expect(fromBaseQuantity(remaining, 'kg')).toBe(48.5);
    expect(formatQuantity(remaining, 'kg')).toBe('48.5 kg');
  });
});

describe('baseUnitsPerUnit', () => {
  it('reports how many base units each unit holds', () => {
    expect(baseUnitsPerUnit('kg')).toBe(1000);
    expect(baseUnitsPerUnit('box')).toBe(1);
  });
});
