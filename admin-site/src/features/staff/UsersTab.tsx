import type { UserProfile } from '@kadai/shared';
import { Button, getErrorMessage, QueryState, useApiQuery, useToast } from '@kadai/ui';
import { UserPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { FILL_REMAINING } from '@/components/ui/fillStyles';
import { Pagination } from '@/components/ui/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ListControls } from '@/hooks/useListControls';
import { useKeepPageInRange } from '@/hooks/usePagination';
import { AdminsTable } from './AdminsTable';
import { ChangeRoleModal } from './ChangeRoleModal';
import { invitesApi } from './invitesApi';
import { hasFilters, NO_FILTERS, type StaffFilters, toStaffQuery } from './staffFilters';
import { useStaffPermissions } from './useStaffPermissions';
import { UserDetailDrawer } from './UserDetailDrawer';

interface UsersTabProps {
  /** Held by the page, because the filters sit on the same line as the tabs. */
  controls: ListControls<StaffFilters>;
  onInvite: () => void;
  /** Runs after anything that changes how many users there are. */
  onChanged: () => void;
}

export function UsersTab({ controls, onInvite, onChanged }: UsersTabProps) {
  const { showToast } = useToast();
  const { canInvite, actionsFor } = useStaffPermissions();
  const { filters, setFilters, page, limit, setPage, setLimit } = controls;
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [changingRoleUser, setChangingRoleUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const appliedFilters = useDebouncedValue(filters);
  const staffQuery = toStaffQuery(appliedFilters);
  const query = useApiQuery(
    (signal) => invitesApi.listAdmins({ ...staffQuery, page, limit }, signal),
    `staff-${JSON.stringify(staffQuery)}-${page}-${limit}`,
  );
  useKeepPageInRange(query.data, setPage);

  const handleUpdated = (updated: UserProfile) => {
    setSelectedUser((current) => (current?.id === updated.id ? updated : current));
    query.refetch();
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const isActive = user.isActive === false;
    try {
      handleUpdated(await invitesApi.updateStaffStatus(user.id, isActive));
      showToast(`${user.name} is now ${isActive ? 'active' : 'deactivated'}`);
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
      setSelectedUser((current) => (current?.id === deletingUser.id ? null : current));
      setDeletingUser(null);
      query.refetch();
      onChanged();
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
        isEmpty={(data) => data.total === 0 && !hasFilters(appliedFilters)}
        empty={
          <EmptyState
            icon={UsersThreeIcon}
            title="No users yet"
            description="Invite your team to give them access to KadaiOS."
            action={
              canInvite && (
                <Button variant="primary" icon={UserPlusIcon} onClick={onInvite}>
                  Invite user
                </Button>
              )
            }
          />
        }
      >
        {(data) => (
          <div className={FILL_REMAINING}>
            <AdminsTable
              admins={data.items}
              isRefreshing={query.isLoading}
              actionsFor={actionsFor}
              emptyState={
                <div className="space-y-3">
                  <p>No users match these filters.</p>
                  <Button onClick={() => setFilters(NO_FILTERS)}>Clear filters</Button>
                </div>
              }
              footer={
                <Pagination
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                />
              }
              onSelectUser={setSelectedUser}
              onChangeRole={setChangingRoleUser}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={setDeletingUser}
            />
          </div>
        )}
      </QueryState>

      <UserDetailDrawer
        user={selectedUser}
        allowed={selectedUser ? actionsFor(selectedUser) : undefined}
        onClose={() => setSelectedUser(null)}
        onChangeRole={setChangingRoleUser}
        onToggleStatus={handleToggleStatus}
      />

      <ChangeRoleModal
        user={changingRoleUser}
        onClose={() => setChangingRoleUser(null)}
        onRoleChanged={handleUpdated}
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
