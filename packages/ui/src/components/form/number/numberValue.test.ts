import { describe, expect, it } from 'vitest';
import { sanitizeNumber, stepNumber } from './numberValue';

describe('sanitizeNumber', () => {
  const money = { decimals: 2, allowNegative: false };

  it.each([
    ['12a3', '123'],
    ['12.', '12.'],
    ['1.2.3', '1.23'],
    ['1.239', '1.23'],
    ['-5', '5'],
    ['', ''],
  ])('turns %j into %j', (raw, result) => {
    expect(sanitizeNumber(raw, money)).toBe(result);
  });

  it('drops the decimal part for whole numbers', () => {
    expect(sanitizeNumber('4.5', { decimals: 0, allowNegative: false })).toBe('4');
  });

  it('keeps a minus sign when negatives are allowed', () => {
    expect(sanitizeNumber('-4', { decimals: 0, allowNegative: true })).toBe('-4');
  });
});

describe('stepNumber', () => {
  it('moves up and down', () => {
    expect(stepNumber('2', 1, { step: 1 })).toBe('3');
    expect(stepNumber('2', -1, { step: 1 })).toBe('1');
  });

  it('avoids decimal rounding errors', () => {
    expect(stepNumber('0.1', 1, { step: 0.2 })).toBe('0.3');
  });

  it('stays in range', () => {
    expect(stepNumber('10', 1, { step: 1, max: 10 })).toBe('10');
    expect(stepNumber('0', -1, { step: 1, min: 0 })).toBe('0');
  });

  it('starts from the minimum when empty', () => {
    expect(stepNumber('', 1, { step: 1, min: 5 })).toBe('5');
  });
});
