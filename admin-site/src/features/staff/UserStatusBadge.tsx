import type { UserProfile } from '@kadai/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function UserStatusBadge({ user }: { user: UserProfile }) {
  return user.isActive === false ? (
    <StatusBadge tone="danger">Deactivated</StatusBadge>
  ) : (
    <StatusBadge tone="success">Active</StatusBadge>
  );
}
