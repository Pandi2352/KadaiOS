import { formatShopDate, type StaffRole, type UserProfile } from '@kadai/shared';
import { Button, buttonClass } from '@kadai/ui';
import { EnvelopeSimpleIcon, PowerIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Drawer } from '@/components/ui/Drawer';
import { RoleBadge } from './RoleBadge';
import { RolePermissionSummary } from './RolePermissionSummary';
import { UserStatusBadge } from './UserStatusBadge';

interface UserDetailDrawerProps {
  /** The person to show. The drawer is open while this is set. */
  user: UserProfile | null;
  onClose: () => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right break-words">{children}</dd>
    </div>
  );
}

export function UserDetailDrawer({ user, onClose, onChangeRole, onToggleStatus }: UserDetailDrawerProps) {
  const staffRole: StaffRole = user?.staffRole ?? 'admin';
  const isActive = user?.isActive !== false;

  return (
    <Drawer isOpen={Boolean(user)} onClose={onClose} title="User details">
      {user && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <p className="truncate text-muted">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button icon={ShieldCheckIcon} onClick={() => onChangeRole(user)}>
              Change role
            </Button>
            <a href={`mailto:${user.email}`} className={buttonClass('outline')}>
              <EnvelopeSimpleIcon size={16} aria-hidden weight="bold" />
              Email
            </a>
            <Button icon={PowerIcon} onClick={() => onToggleStatus(user)}>
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>

          <dl className="space-y-2.5">
            <Detail label="Role">
              <RoleBadge role={staffRole} />
            </Detail>
            <Detail label="Status">
              <UserStatusBadge user={user} />
            </Detail>
            <Detail label="Phone">{user.phone || 'Not added'}</Detail>
            <Detail label="Joined">{formatShopDate(new Date(user.createdAt))}</Detail>
            <Detail label="Last login">
              {user.lastLoginAt ? formatShopDate(new Date(user.lastLoginAt)) : 'Never'}
            </Detail>
          </dl>

          <section className="border-t border-popup-line pt-4">
            <h3 className="mb-3 font-semibold">What this role can do</h3>
            <RolePermissionSummary role={staffRole} />
          </section>
        </div>
      )}
    </Drawer>
  );
}
