import { type AuthRole, formatShopDate, type UserProfile } from '@kadai/shared';
import { getInitials } from './getInitials';

const ROLE_LABELS: Record<AuthRole, string> = { admin: 'Admin', customer: 'Customer' };

export function ProfileSummary({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-md bg-brand text-xl font-semibold text-on-brand"
      >
        {getInitials(profile.name)}
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-ink">{profile.name}</h2>
        <p className="truncate text-muted">{profile.email}</p>
        <p className="mt-0.5 text-xs text-muted">
          {ROLE_LABELS[profile.role]} · Joined {formatShopDate(new Date(profile.createdAt))}
        </p>
      </div>
    </div>
  );
}
