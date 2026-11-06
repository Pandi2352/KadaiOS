import { type AuthUser, type Permission, STAFF_ROLE_DEFINITIONS, STAFF_ROLES, type StaffRole } from './auth.js';

/** The same check on the server and in the admin app, so what's hidden always matches what's refused. */
export function hasPermission(user: Pick<AuthUser, 'role' | 'staffRole'> | null | undefined, permission: Permission) {
  if (user?.role !== 'admin' || !user.staffRole) return false;
  return STAFF_ROLE_DEFINITIONS[user.staffRole].permissions.includes(permission);
}

/** Your own role and everything below it, so nobody can hand out more access than they have. */
export function getAssignableRoles(role: StaffRole | undefined): StaffRole[] {
  return role ? STAFF_ROLES.slice(STAFF_ROLES.indexOf(role)) : [];
}

export const canAssignRole = (actorRole: StaffRole | undefined, role: StaffRole) =>
  getAssignableRoles(actorRole).includes(role);
