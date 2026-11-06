import { STAFF_ROLE_DEFINITIONS, type StaffRole } from '@kadai/shared';
import { SelectField } from '@kadai/ui';
import { ROLE_OPTIONS } from './roleOptions';
import { RolePermissionSummary } from './RolePermissionSummary';

interface RoleSelectFieldProps {
  label: string;
  value: StaffRole;
  onChange: (role: StaffRole) => void;
}

/** Picks a role and shows what it allows, so nobody has to guess what they're granting. */
export function RoleSelectField({ label, value, onChange }: RoleSelectFieldProps) {
  return (
    <div className="space-y-4">
      <SelectField
        label={label}
        required
        options={ROLE_OPTIONS}
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
