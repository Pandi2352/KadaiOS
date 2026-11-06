import { Button, QueryState, useApiQuery } from '@kadai/ui';
import { EnvelopeSimpleIcon, UserPlusIcon } from '@phosphor-icons/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ListControls } from '@/hooks/useListControls';
import { useKeepPageInRange } from '@/hooks/usePagination';
import { AdminInvitesTable } from './AdminInvitesTable';
import { hasInviteFilters, type InviteFilters, NO_INVITE_FILTERS, toInviteQuery } from './inviteFilters';
import { invitesApi } from './invitesApi';
import { useStaffPermissions } from './useStaffPermissions';

interface InvitesTabProps {
  /** Held by the page, because the filters sit on the same line as the tabs. */
  controls: ListControls<InviteFilters>;
  onInvite: () => void;
  /** Runs after anything that changes how many invitations are pending. */
  onChanged: () => void;
}

export function InvitesTab({ controls, onInvite, onChanged }: InvitesTabProps) {
  const { canInvite } = useStaffPermissions();
  const { filters, setFilters, page, limit, setPage, setLimit } = controls;
  const appliedFilters = useDebouncedValue(filters);
  const inviteQuery = toInviteQuery(appliedFilters);
  const query = useApiQuery(
    (signal) => invitesApi.listInvites({ ...inviteQuery, page, limit }, signal),
    `invites-${JSON.stringify(inviteQuery)}-${page}-${limit}`,
  );
  useKeepPageInRange(query.data, setPage);

  return (
    <QueryState
      query={query}
      loadingLabel="Loading invitations"
      errorTitle="Couldn't load invitations"
      isEmpty={(data) => data.total === 0 && !hasInviteFilters(appliedFilters)}
      empty={
        <EmptyState
          icon={EnvelopeSimpleIcon}
          title="No invitations yet"
          description="Invite someone and you can track their invitation here until they accept it."
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
        <AdminInvitesTable
          invites={data.items}
          isRefreshing={query.isLoading}
          onChanged={() => {
            query.refetch();
            onChanged();
          }}
          emptyState={
            <div className="space-y-3">
              <p>No invitations match these filters.</p>
              <Button onClick={() => setFilters(NO_INVITE_FILTERS)}>Clear filters</Button>
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
        />
      )}
    </QueryState>
  );
}
