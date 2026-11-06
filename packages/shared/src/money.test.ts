import { describe, expect, it } from 'vitest';
import { formatPaise, lineTotalPaise, percentOfPaise, toPaise } from './money.js';

describe('toPaise', () => {
  it.each([
    ['12.34', 1234],
    [12.34, 1234],
    ['0', 0],
    ['5', 500],
    ['5.5', 550],
    // These lose precision with `value * 100` in floating point.
    [1.15, 115],
    [19.99, 1999],
    [4.35, 435],
    ['1.005', 101],
    ['1.004', 100],
    ['-2.50', -250],
  ])('converts %s to %s paise', (rupees, paise) => {
    expect(toPaise(rupees)).toBe(paise);
  });

  it.each(['', 'abc', '1,000', '1.2.3', 'NaN'])('rejects %j', (value) => {
    expect(() => toPaise(value)).toThrow(RangeError);
  });

  it('rejects amounts beyond the safe integer range', () => {
    expect(() => toPaise('99999999999999999')).toThrow(RangeError);
  });
});

describe('lineTotalPaise', () => {
  it('calculates the plan example: 1.5 kg at 240 rupees per kg', () => {
    expect(lineTotalPaise(24000, 1500, 1000)).toBe(36000);
  });

  it('rounds half up to the nearest paisa', () => {
    expect(lineTotalPaise(101, 500, 1000)).toBe(51);
    expect(lineTotalPaise(100, 333, 1000)).toBe(33);
  });

  it('multiplies whole items directly', () => {
    expect(lineTotalPaise(1999, 3)).toBe(5997);
  });
});

describe('percentOfPaise', () => {
  it('calculates 12.5% from basis points', () => {
    expect(percentOfPaise(10000, 1250)).toBe(1250);
  });

  it('rounds to the nearest paisa', () => {
    expect(percentOfPaise(999, 500)).toBe(50);
  });
});

describe('formatPaise', () => {
  it('uses rupees and Indian digit grouping', () => {
    expect(formatPaise(12345678)).toBe('₹1,23,456.78');
  });
});
