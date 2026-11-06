import type { StaffListQuery, StaffRole, StaffStatus } from '@kadai/shared';

export type RoleFilter = 'all' | StaffRole;
export type StatusFilter = 'all' | StaffStatus;

export interface StaffFilters {
  search: string;
  role: RoleFilter;
  status: StatusFilter;
}

export const NO_FILTERS: StaffFilters = { search: '', role: 'all', status: 'all' };

export const hasFilters = ({ search, role, status }: StaffFilters) =>
  search.trim() !== '' || role !== 'all' || status !== 'all';

export const toStaffQuery = ({ search, role, status }: StaffFilters): StaffListQuery => ({
  search: search.trim() || undefined,
  staffRole: role === 'all' ? undefined : role,
  status: status === 'all' ? undefined : status,
});
