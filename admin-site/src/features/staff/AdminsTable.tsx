import { formatShopDate, type UserProfile } from '@kadai/shared';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { EntityCell } from '@/components/ui/DataTable/cells';
import { Table, type TableColumn } from '@/components/ui/Table';
import { RoleBadge } from './RoleBadge';
import { UserRowActions } from './UserRowActions';
import { UserStatusBadge } from './UserStatusBadge';

interface AdminsTableProps {
  admins: UserProfile[];
  isRefreshing: boolean;
  emptyState: ReactNode;
  onSelectUser: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
}

export function AdminsTable({
  admins,
  isRefreshing,
  emptyState,
  onSelectUser,
  onChangeRole,
  onToggleStatus,
  onDeleteUser,
}: AdminsTableProps) {
  // On small screens the less important columns go, because the drawer shows them too.
  const columns: TableColumn<UserProfile>[] = [
    {
      key: 'name',
      header: 'Name',
      // Takes the spare width and lets a long email shorten, instead of pushing the table off a phone screen.
      className: 'w-full max-w-0',
      render: (user) => (
        <>
          <EntityCell title={user.name} subtitle={user.email} avatar={<Avatar name={user.name} />} />
          {/* On phones the status moves here, so the name gets the width it needs. */}
          <div className="mt-1.5 pl-12 sm:hidden">
            <UserStatusBadge user={user} />
          </div>
        </>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      className: 'hidden sm:table-cell',
      render: (user) => <RoleBadge role={user.staffRole} />,
    },
    {
      key: 'lastLoginAt',
      header: 'Last login',
      className: 'hidden whitespace-nowrap xl:table-cell',
      render: (user) => (
        <span className="text-muted">{user.lastLoginAt ? formatShopDate(new Date(user.lastLoginAt)) : 'Never'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      className: 'hidden whitespace-nowrap md:table-cell',
      render: (user) => <span className="text-muted">{formatShopDate(new Date(user.createdAt))}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'hidden sm:table-cell',
      render: (user) => <UserStatusBadge user={user} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-14',
      render: (user) => (
        <UserRowActions
          user={user}
          onViewDetails={onSelectUser}
          onChangeRole={onChangeRole}
          onToggleStatus={onToggleStatus}
          onDeleteUser={onDeleteUser}
        />
      ),
    },
  ];

  return (
    <Table
      caption="Users"
      columns={columns}
      rows={admins}
      rowKey={(admin) => admin.id}
      isRefreshing={isRefreshing}
      onRowClick={onSelectUser}
      emptyState={emptyState}
    />
  );
}
