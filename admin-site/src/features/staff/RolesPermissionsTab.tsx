import { PERMISSION_GROUPS, PERMISSIONS, STAFF_ROLE_DEFINITIONS, STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { cn } from '@kadai/ui';
import { CheckCircleIcon, MinusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { MenuButton } from '@/components/ui/MenuItem';
import { ROLE_ICONS } from './roleOptions';

export function RolesPermissionsTab() {
  const [selectedRole, setSelectedRole] = useState<StaffRole>('super_admin');
  const role = STAFF_ROLE_DEFINITIONS[selectedRole];

  return (
    <div className="grid items-start gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[15rem_1fr] lg:grid-rows-[minmax(0,1fr)]">
      <div role="group" aria-label="Roles" className="space-y-1">
        {STAFF_ROLES.map((roleKey) => (
          <MenuButton
            key={roleKey}
            icon={ROLE_ICONS[roleKey]}
            isActive={roleKey === selectedRole}
            onClick={() => setSelectedRole(roleKey)}
          >
            <span className="min-w-0 flex-1 truncate">{STAFF_ROLE_DEFINITIONS[roleKey].name}</span>
            <span className="text-xs tabular-nums">{STAFF_ROLE_DEFINITIONS[roleKey].permissions.length}</span>
          </MenuButton>
        ))}
      </div>

      <section className="rounded-md bg-surface p-4 lg:h-full lg:overflow-y-auto">
        <h2 className="text-base font-semibold">{role.name}</h2>
        <p className="mt-0.5 text-muted">
          {role.description} {role.permissions.length} of {PERMISSIONS.length} permissions.
        </p>

        <div className="mt-2 divide-y divide-line">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group} className="grid gap-3 py-4 last:pb-0 md:grid-cols-[11rem_1fr]">
              <h3 className="font-medium">{group}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {PERMISSIONS.filter((permission) => permission.group === group).map((permission) => {
                  const isGranted = role.permissions.includes(permission.id);

                  return (
                    <li key={permission.id} className="flex items-start gap-2">
                      {isGranted ? (
                        <CheckCircleIcon
                          size={18}
                          weight="fill"
                          aria-label="Allowed"
                          className="shrink-0 text-success"
                        />
                      ) : (
                        <MinusIcon size={18} aria-label="Not allowed" className="shrink-0 text-muted" />
                      )}
                      <div className="min-w-0">
                        <p className={cn(isGranted ? 'font-medium' : 'text-muted')}>{permission.label}</p>
                        <p className="text-xs text-muted">{permission.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
