import { formatShopDate, type UserProfile } from '@kadai/shared';
import { Table, type TableColumn } from '@/components/ui/Table';

const COLUMNS: TableColumn<UserProfile>[] = [
  {
    key: 'name',
    header: 'Administrator',
    render: (user) => <span className="font-medium">{user.name}</span>,
  },
  {
    key: 'email',
    header: 'Email address',
    render: (user) => user.email,
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (user) => user.phone ?? <span className="text-muted">—</span>,
  },
  {
    key: 'createdAt',
    header: 'Joined On',
    render: (user) => formatShopDate(new Date(user.createdAt)),
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
    />
  );
}

