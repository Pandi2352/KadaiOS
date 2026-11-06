import { STAFF_ROLE_DEFINITIONS, type StaffRole, type UserProfile } from '@kadai/shared';

export type RoleFilter = 'all' | StaffRole;
export type StatusFilter = 'all' | 'active' | 'deactivated';

export interface AdminFilters {
  search: string;
  role: RoleFilter;
  status: StatusFilter;
}

export const NO_FILTERS: AdminFilters = { search: '', role: 'all', status: 'all' };

export function filterAdmins(admins: UserProfile[], { search, role, status }: AdminFilters): UserProfile[] {
  const query = search.trim().toLowerCase();

  return admins.filter((user) => {
    const userRole = user.staffRole ?? 'admin';
    const isActive = user.isActive !== false;

    if (role !== 'all' && userRole !== role) return false;
    if (status !== 'all' && isActive !== (status === 'active')) return false;
    if (!query) return true;

    return [user.name, user.email, STAFF_ROLE_DEFINITIONS[userRole].name].some((text) =>
      text.toLowerCase().includes(query),
    );
  });
}
