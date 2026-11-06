import { STAFF_ROLE_DEFINITIONS, STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { SelectField } from '@kadai/ui';
import { ROLE_OPTIONS } from './roleOptions';
import { RolePermissionSummary } from './RolePermissionSummary';

interface RoleSelectFieldProps {
  label: string;
  value: StaffRole;
  onChange: (role: StaffRole) => void;
  /** The roles to offer. Defaults to all of them. */
  roles?: readonly StaffRole[];
}

/** Picks a role and shows what it allows, so nobody has to guess what they're granting. */
export function RoleSelectField({ label, value, onChange, roles = STAFF_ROLES }: RoleSelectFieldProps) {
  return (
    <div className="space-y-4">
      <SelectField
        label={label}
        required
        options={ROLE_OPTIONS.filter((option) => roles.includes(option.value))}
        value={value}
        onChange={(role) => {
          if (role) onChange(role);
        }}
        hint={STAFF_ROLE_DEFINITIONS[value].description}
      />
      <RolePermissionSummary role={value} />
    </div>
  );
}
