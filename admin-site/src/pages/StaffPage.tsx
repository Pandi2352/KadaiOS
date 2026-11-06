import type { AdminInvite } from '@kadai/shared';
import { Button, QueryState, useApiQuery, useToast } from '@kadai/ui';
import { EnvelopeSimpleIcon, UserPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminInvitesTable } from '@/features/staff/AdminInvitesTable';
import { AdminsTable } from '@/features/staff/AdminsTable';
import { InviteAdminModal } from '@/features/staff/InviteAdminModal';
import { invitesApi } from '@/features/staff/invitesApi';
import { usePageTitle } from '@/hooks/usePageTitle';

export function StaffPage() {
  const { showToast } = useToast();
  usePageTitle('Staff & Administrators');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const adminsQuery = useApiQuery((signal) => invitesApi.listAdmins(signal), 'staff-admins');
  const invitesQuery = useApiQuery((signal) => invitesApi.listInvites(signal), 'staff-invites');

  const handleInvited = (invite: AdminInvite) => {
    showToast(`Invitation sent to ${invite.email}`, { title: 'Invitation sent' });
    invitesQuery.refetch();
  };

  const inviteButton = (
    <Button variant="primary" icon={UserPlusIcon} onClick={() => setIsInviteOpen(true)}>
      Invite admin
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Administrators"
        description="View administrator accounts and invite colleagues via email."
        actions={inviteButton}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted">Active Administrators</h3>
        <QueryState
          query={adminsQuery}
          loadingLabel="Loading administrators"
          errorTitle="Couldn't load administrators"
          isEmpty={(admins) => admins.length === 0}
          empty={
            <EmptyState
              icon={UsersThreeIcon}
              title="No administrators found"
              description="No administrator accounts found."
            />
          }
        >
          {(admins) => <AdminsTable admins={admins} isRefreshing={adminsQuery.isLoading} />}
        </QueryState>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted">Invitations Sent</h3>
        <QueryState
          query={invitesQuery}
          loadingLabel="Loading invitations"
          errorTitle="Couldn't load invitations"
          isEmpty={(invites) => invites.length === 0}
          empty={
            <EmptyState
              icon={EnvelopeSimpleIcon}
              title="No invitations sent yet"
              description="Invite other administrators to help manage shops, inventory, and operations."
              action={inviteButton}
            />
          }
        >
          {(invites) => (
            <AdminInvitesTable
              invites={invites}
              isRefreshing={invitesQuery.isLoading}
              onChanged={() => invitesQuery.refetch()}
            />
          )}
        </QueryState>
      </div>

      <InviteAdminModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onInvited={handleInvited} />
    </div>
  );
}
