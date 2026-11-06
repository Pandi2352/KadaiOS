import { formatShopDate, type UserProfile } from '@kadai/shared';
import { ShieldCheckIcon, UserIcon } from '@phosphor-icons/react';
import { Table, type TableColumn } from '@/components/ui/Table';
import { EntityCell } from '@/components/ui/DataTable/cells';

const COLUMNS: TableColumn<UserProfile>[] = [
  {
    key: 'name',
    header: 'Administrator',
    sortable: true,
    render: (user) => (
      <EntityCell title={user.name} subtitle={user.email} icon={<UserIcon size={18} weight="duotone" />} verified />
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: () => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-soft text-brand">
        <ShieldCheckIcon size={14} weight="bold" />
        Administrator
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Phone Contact',
    render: (user) =>
      user.phone ? (
        <span className="font-mono text-xs font-medium text-ink">{user.phone}</span>
      ) : (
        <span className="text-muted text-xs">—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Joined On',
    align: 'right',
    sortable: true,
    render: (user) => <span className="font-mono text-xs text-muted">{formatShopDate(new Date(user.createdAt))}</span>,
  },
];

export function AdminsTable({ admins, isRefreshing }: { admins: UserProfile[]; isRefreshing: boolean }) {
  return (
    <Table
      caption="Active Administrators"
      columns={COLUMNS}
      rows={admins}
      rowKey={(admin) => admin.id}
      isRefreshing={isRefreshing}
      showRank
      starable
    />
  );
}
