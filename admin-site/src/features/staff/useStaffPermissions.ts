import { getAssignableRoles, type UserProfile } from '@kadai/shared';
import { useAuth } from '@kadai/ui';
import { useCallback } from 'react';
import { useCan } from '@/hooks/useCan';

export interface UserActions {
  changeRole: boolean;
  /** Deactivating, activating and deleting share one permission. */
  manageAccount: boolean;
}

/**
 * What the logged-in person can do on the Staff page. Their own account's role and status
 * are left out, because the server refuses most of those and the rest would lock them out.
 */
export function useStaffPermissions() {
  const { user: me } = useAuth();
  const can = useCan();
  const canChangeRoles = can('users:manage_roles');
  const canManageAccounts = can('users:delete');

  const actionsFor = useCallback(
    (user: UserProfile): UserActions => ({
      changeRole: canChangeRoles && user.id !== me?.id,
      manageAccount: canManageAccounts && user.id !== me?.id,
    }),
    [canChangeRoles, canManageAccounts, me?.id],
  );

  return {
    canInvite: can('users:invite'),
    assignableRoles: getAssignableRoles(me?.staffRole),
    actionsFor,
  };
}
