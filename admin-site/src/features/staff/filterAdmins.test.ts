import type { UserProfile } from '@kadai/shared';
import { describe, expect, it } from 'vitest';
import { filterAdmins, NO_FILTERS } from './filterAdmins';

const person = (name: string, overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: name,
  name,
  email: `${name.toLowerCase()}@kadaios.test`,
  role: 'admin',
  createdAt: '2026-01-01',
  ...overrides,
});

const admins = [
  person('Meena', { staffRole: 'manager' }),
  person('Arun', { staffRole: 'viewer', isActive: false }),
  person('Selvi'),
];

const names = (filters: Partial<typeof NO_FILTERS>) =>
  filterAdmins(admins, { ...NO_FILTERS, ...filters }).map(({ name }) => name);

describe('filterAdmins', () => {
  it('keeps everyone with no filters', () => {
    expect(names({})).toEqual(['Meena', 'Arun', 'Selvi']);
  });

  it('searches names, emails and role names, ignoring case and spaces', () => {
    expect(names({ search: '  MEENA ' })).toEqual(['Meena']);
    expect(names({ search: 'arun@' })).toEqual(['Arun']);
    expect(names({ search: 'shop manager' })).toEqual(['Meena']);
  });

  it('treats a person with no role as an administrator', () => {
    expect(names({ role: 'admin' })).toEqual(['Selvi']);
  });

  it('treats a person with no status as active', () => {
    expect(names({ status: 'active' })).toEqual(['Meena', 'Selvi']);
    expect(names({ status: 'deactivated' })).toEqual(['Arun']);
  });

  it('applies every filter together', () => {
    expect(names({ role: 'manager', status: 'deactivated' })).toEqual([]);
  });
});
