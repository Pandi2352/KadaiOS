import { hasPermission, type Permission } from '@kadai/shared';
import { useAuth } from '@kadai/ui';
import { useCallback } from 'react';

export type Can = (permission: Permission) => boolean;

/**
 * Whether the logged-in person's role includes a permission. This only decides what to show:
 * the server makes its own check on every request.
 */
export function useCan(): Can {
  const { user } = useAuth();
  return useCallback((permission) => hasPermission(user, permission), [user]);
}
