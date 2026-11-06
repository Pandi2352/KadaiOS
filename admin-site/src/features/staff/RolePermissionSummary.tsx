import { PERMISSION_GROUPS, PERMISSIONS, STAFF_ROLE_DEFINITIONS, type StaffRole } from '@kadai/shared';

/** What a role can do, grouped and written as plain text. Groups the role has no access to are left out. */
export function RolePermissionSummary({ role }: { role: StaffRole }) {
  const granted = PERMISSIONS.filter((permission) => STAFF_ROLE_DEFINITIONS[role].permissions.includes(permission.id));

  return (
    <dl className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const labels = granted.filter((permission) => permission.group === group).map(({ label }) => label);
        if (labels.length === 0) return null;

        return (
          <div key={group}>
            <dt className="font-medium">{group}</dt>
            <dd className="mt-0.5 text-muted">{labels.join(', ')}</dd>
          </div>
        );
      })}
    </dl>
  );
}
