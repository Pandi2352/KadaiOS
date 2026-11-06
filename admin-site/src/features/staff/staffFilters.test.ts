import { describe, expect, it } from 'vitest';
import { hasFilters, NO_FILTERS, toStaffQuery } from './staffFilters';

describe('staff filters', () => {
  it('sends nothing for "all"', () => {
    expect(toStaffQuery(NO_FILTERS)).toEqual({ search: undefined, staffRole: undefined, status: undefined });
  });

  it('trims the search and sends the chosen values', () => {
    expect(toStaffQuery({ search: '  meena ', role: 'manager', status: 'deactivated' })).toEqual({
      search: 'meena',
      staffRole: 'manager',
      status: 'deactivated',
    });
  });

  it('knows when a filter is on, ignoring spaces', () => {
    expect(hasFilters(NO_FILTERS)).toBe(false);
    expect(hasFilters({ ...NO_FILTERS, search: '   ' })).toBe(false);
    expect(hasFilters({ ...NO_FILTERS, search: 'a' })).toBe(true);
    expect(hasFilters({ ...NO_FILTERS, status: 'active' })).toBe(true);
  });
});
