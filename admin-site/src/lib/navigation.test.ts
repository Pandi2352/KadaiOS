import { hasPermission, type StaffRole } from '@kadai/shared';
import { describe, expect, it } from 'vitest';
import { MODULES } from '@/config/modules';
import { canOpenModule, getVisibleNavigation, getVisibleQuickActions } from './navigation';

const canFor = (staffRole: StaffRole) => (permission: Parameters<typeof hasPermission>[1]) =>
  hasPermission({ role: 'admin', staffRole }, permission);

const moduleIds = (staffRole: StaffRole) =>
  getVisibleNavigation('meat', canFor(staffRole)).flatMap((section) =>
    section.entries.flatMap((entry) => (entry.kind === 'link' ? [entry.module] : entry.children)),
  );

describe('navigation by role', () => {
  it('shows a super admin everything', () => {
    const ids = moduleIds('super_admin');
    expect(ids).toContain('staff');
    expect(ids).toContain('setup');
    expect(ids).toContain('wastage');
  });

  it('hides Staff from everyone without users:view', () => {
    expect(moduleIds('manager')).not.toContain('staff');
    expect(moduleIds('staff')).not.toContain('staff');
    expect(moduleIds('viewer')).not.toContain('staff');
  });

  it('gives a cashier billing but not reports or setup', () => {
    const ids = moduleIds('staff');
    expect(ids).toContain('billing');
    expect(ids).not.toContain('reports');
    expect(ids).not.toContain('setup');
  });

  it('keeps a read-only viewer away from billing and offers them nothing to create', () => {
    expect(moduleIds('viewer')).not.toContain('billing');
    expect(getVisibleQuickActions('meat', canFor('viewer'))).toEqual([]);
  });

  it('lets anyone open the dashboard and their own profile', () => {
    const can = canFor('viewer');
    expect(canOpenModule(MODULES.dashboard, can)).toBe(true);
    expect(canOpenModule(MODULES.profile, can)).toBe(true);
    expect(canOpenModule(MODULES.staff, can)).toBe(false);
  });

  it('shows nothing with a permission to anyone without a role', () => {
    const can = () => false;
    expect(getVisibleNavigation('meat', can).flatMap((section) => section.entries)).toEqual([
      { kind: 'link', module: 'dashboard' },
    ]);
  });
});
