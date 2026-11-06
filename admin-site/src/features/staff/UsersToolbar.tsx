import { Select, type SelectOption } from '@kadai/ui';
import { SearchBox } from '@/components/ui/SearchBox';
import { ROLE_OPTIONS } from './roleOptions';
import type { RoleFilter, StaffFilters, StatusFilter } from './staffFilters';

const ROLE_FILTERS: SelectOption<RoleFilter>[] = [{ value: 'all', label: 'All roles' }, ...ROLE_OPTIONS];

const STATUS_FILTERS: SelectOption<StatusFilter>[] = [
  { value: 'all', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' },
];

interface UsersToolbarProps {
  filters: StaffFilters;
  onChange: (filters: StaffFilters) => void;
}

export function UsersToolbar({ filters, onChange }: UsersToolbarProps) {
  const update = (changes: Partial<StaffFilters>) => onChange({ ...filters, ...changes });

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="min-w-0 flex-1">
        <SearchBox
          label="Search users"
          placeholder="Search by name, email or role"
          value={filters.search}
          onChange={(search) => update({ search })}
        />
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
        <div className="sm:w-44">
          <Select
            aria-label="Filter by role"
            options={ROLE_FILTERS}
            value={filters.role}
            onChange={(role) => update({ role: role || 'all' })}
          />
        </div>
        <div className="sm:w-36">
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
