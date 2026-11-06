import { FieldAction, Input, Select, type SelectOption } from '@kadai/ui';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import type { AdminFilters, RoleFilter, StatusFilter } from './filterAdmins';
import { ROLE_OPTIONS } from './roleOptions';

const ROLE_FILTERS: SelectOption<RoleFilter>[] = [{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS];

const STATUS_FILTERS: SelectOption<StatusFilter>[] = [
  { value: 'all', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' },
];

interface UsersToolbarProps {
  filters: AdminFilters;
  onChange: (filters: AdminFilters) => void;
}

export function UsersToolbar({ filters, onChange }: UsersToolbarProps) {
  const update = (changes: Partial<AdminFilters>) => onChange({ ...filters, ...changes });

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="min-w-0 flex-1 sm:max-w-sm">
        <Input
          aria-label="Search users"
          placeholder="Search by name, email or role"
          startIcon={MagnifyingGlassIcon}
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          endSlot={
            filters.search && <FieldAction icon={XIcon} label="Clear search" onClick={() => update({ search: '' })} />
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <div className="sm:w-48">
          <Select
            aria-label="Filter by role"
            options={ROLE_FILTERS}
            value={filters.role}
            onChange={(role) => update({ role: role || 'all' })}
          />
        </div>
        <div className="sm:w-40">
          <Select
            aria-label="Filter by status"
            options={STATUS_FILTERS}
            value={filters.status}
            onChange={(status) => update({ status: status || 'all' })}
          />
        </div>
      </div>
    </div>
  );
}
