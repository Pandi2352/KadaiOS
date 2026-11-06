import { STAFF_ROLE_DEFINITIONS, type StaffRole } from '@kadai/shared';
import { ROLE_ICONS } from './roleOptions';

/** A role's icon and name, without a box, so a table full of them stays calm. */
export function RoleBadge({ role = 'admin' }: { role?: StaffRole }) {
  const Icon = ROLE_ICONS[role];

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      title={STAFF_ROLE_DEFINITIONS[role].description}
    >
      <Icon size={16} aria-hidden className="shrink-0 text-brand" />
      {STAFF_ROLE_DEFINITIONS[role].name}
    </span>
  );
}
