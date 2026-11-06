import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  formatDateKey,
  formatMonth,
  isInRange,
  isMonthInRange,
  monthGrid,
  startOfWeek,
} from './dateValue';

describe('dateValue', () => {
  it('moves across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('stays inside the target month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
    expect(addMonths('2026-11-06', -12)).toBe('2025-11-06');
  });

  it('finds the week, which starts on Sunday', () => {
    expect(startOfWeek('2026-11-06')).toBe('2026-11-01');
    expect(endOfWeek('2026-11-06')).toBe('2026-11-07');
  });

  it('builds six full weeks that start on a Sunday', () => {
    const grid = monthGrid('2026-02-15');
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-02-01');
    expect(grid[41]).toBe('2026-03-14');
  });

  it('checks the allowed range', () => {
    expect(isInRange('2026-11-06', '2026-11-01', '2026-11-30')).toBe(true);
    expect(isInRange('2026-10-31', '2026-11-01')).toBe(false);
    expect(isInRange('2026-12-01', undefined, '2026-11-30')).toBe(false);
    expect(clampDate('2026-10-31', '2026-11-01')).toBe('2026-11-01');
    expect(clampDate('2026-12-01', undefined, '2026-11-30')).toBe('2026-11-30');
    expect(isMonthInRange('2026-11-30', '2026-11-29')).toBe(true);
    expect(isMonthInRange('2026-10-31', '2026-11-01')).toBe(false);
  });

  it('formats without shifting the day', () => {
    expect(formatDateKey('2026-11-06')).toBe('6 Nov 2026');
    expect(formatMonth('2026-11-06')).toBe('November 2026');
  });
});
