import { STAFF_ROLE_DEFINITIONS, type StaffRole } from '@kadai/shared';
import { cn } from '@kadai/ui';
import { ROLE_ICONS, ROLE_TONES } from './roleOptions';

/** A role's icon and name, in that role's colour. */
export function RoleBadge({ role = 'admin' }: { role?: StaffRole }) {
  const Icon = ROLE_ICONS[role];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap',
        ROLE_TONES[role],
      )}
      title={STAFF_ROLE_DEFINITIONS[role].description}
    >
      <Icon size={14} aria-hidden className="shrink-0" />
      {STAFF_ROLE_DEFINITIONS[role].name}
    </span>
  );
}
