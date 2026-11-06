import { STAFF_ROLE_DEFINITIONS, STAFF_ROLES, type StaffRole } from '@kadai/shared';
import type { IconComponent, SelectOption } from '@kadai/ui';
import { EyeIcon, IdentificationCardIcon, ShieldCheckIcon, ShieldIcon, StorefrontIcon } from '@phosphor-icons/react';

export const ROLE_ICONS: Record<StaffRole, IconComponent> = {
  super_admin: ShieldCheckIcon,
  admin: ShieldIcon,
  manager: StorefrontIcon,
  staff: IdentificationCardIcon,
  viewer: EyeIcon,
};

export const ROLE_TONES: Record<StaffRole, string> = {
  super_admin: 'bg-role-super-soft text-role-super',
  admin: 'bg-role-admin-soft text-role-admin',
  manager: 'bg-role-manager-soft text-role-manager',
  staff: 'bg-role-staff-soft text-role-staff',
  viewer: 'bg-role-viewer-soft text-role-viewer',
};

export const ROLE_OPTIONS: SelectOption<StaffRole>[] = STAFF_ROLES.map((role) => ({
  value: role,
  label: STAFF_ROLE_DEFINITIONS[role].name,
  icon: ROLE_ICONS[role],
}));
