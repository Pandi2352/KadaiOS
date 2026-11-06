import { Select, type SelectOption } from '@kadai/ui';
import { SearchBox } from '@/components/ui/SearchBox';
import type { InviteFilters, InviteStatusFilter } from './inviteFilters';

const STATUS_FILTERS: SelectOption<InviteStatusFilter>[] = [
  { value: 'all', label: 'Any status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'expired', label: 'Expired' },
];

interface InvitesToolbarProps {
  filters: InviteFilters;
  onChange: (filters: InviteFilters) => void;
}

export function InvitesToolbar({ filters, onChange }: InvitesToolbarProps) {
  const update = (changes: Partial<InviteFilters>) => onChange({ ...filters, ...changes });

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="min-w-0 flex-1">
        <SearchBox
          label="Search invitations"
          placeholder="Search by email"
          value={filters.search}
          onChange={(search) => update({ search })}
        />
      </div>
      <div className="shrink-0 sm:w-36">
        <Select
          aria-label="Filter by status"
          options={STATUS_FILTERS}
          value={filters.status}
          onChange={(status) => update({ status: status || 'all' })}
        />
      </div>
    </div>
  );
}
