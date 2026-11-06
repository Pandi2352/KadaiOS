import type { UserProfile } from '@kadai/shared';
import { type ApiQuery, Button, getErrorMessage, QueryState, useToast } from '@kadai/ui';
import { UserPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminsTable } from './AdminsTable';
import { ChangeRoleModal } from './ChangeRoleModal';
import { type AdminFilters, filterAdmins, NO_FILTERS } from './filterAdmins';
import { invitesApi } from './invitesApi';
import { UserDetailDrawer } from './UserDetailDrawer';
import { UsersToolbar } from './UsersToolbar';

interface UsersTabProps {
  query: ApiQuery<UserProfile[]>;
  onInvite: () => void;
}

export function UsersTab({ query, onInvite }: UsersTabProps) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<AdminFilters>(NO_FILTERS);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [changingRoleUser, setChangingRoleUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Found by id each time, so the drawer shows fresh details after a change and closes after a delete.
  const selectedUser = query.data?.find((user) => user.id === selectedUserId) ?? null;

  const handleToggleStatus = async (user: UserProfile) => {
    const isActive = user.isActive === false;
    try {
      await invitesApi.updateStaffStatus(user.id, isActive);
      showToast(`${user.name} is now ${isActive ? 'active' : 'deactivated'}`);
      query.refetch();
    } catch (error) {
      showToast(getErrorMessage(error), { tone: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await invitesApi.deleteStaffUser(deletingUser.id);
      showToast(`${deletingUser.name}'s account was deleted`);
      setDeletingUser(null);
      query.refetch();
    } catch (error) {
      showToast(getErrorMessage(error), { tone: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <QueryState
        query={query}
        loadingLabel="Loading users"
        errorTitle="Couldn't load users"
        isEmpty={(admins) => admins.length === 0}
        empty={
          <EmptyState
            icon={UsersThreeIcon}
            title="No users yet"
            description="Invite your team to give them access to KadaiOS."
            action={
              <Button variant="primary" icon={UserPlusIcon} onClick={onInvite}>
                Invite user
              </Button>
            }
          />
        }
      >
        {(admins) => (
          <div className="space-y-3">
            <UsersToolbar filters={filters} onChange={setFilters} />
            <AdminsTable
              admins={filterAdmins(admins, filters)}
              isRefreshing={query.isLoading}
              emptyState={
                <div className="space-y-3">
                  <p>No users match these filters.</p>
                  <Button onClick={() => setFilters(NO_FILTERS)}>Clear filters</Button>
                </div>
              }
              onSelectUser={(user) => setSelectedUserId(user.id)}
              onChangeRole={setChangingRoleUser}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={setDeletingUser}
            />
          </div>
        )}
      </QueryState>

      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUserId(null)}
        onChangeRole={setChangingRoleUser}
        onToggleStatus={handleToggleStatus}
      />

      <ChangeRoleModal
        user={changingRoleUser}
        onClose={() => setChangingRoleUser(null)}
        onRoleChanged={query.refetch}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        title="Delete this account?"
        description={`${deletingUser?.name} (${deletingUser?.email}) will lose access for good. This can't be undone.`}
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingUser(null)}
      />
    </>
  );
}
