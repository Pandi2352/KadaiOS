import type { AdminInvite } from '@kadai/shared';
import { Button, QueryState, useApiQuery, useToast } from '@kadai/ui';
import { EnvelopeSimpleIcon, ShieldCheckIcon, UserPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { type TabItem, Tabs } from '@/components/ui/Tabs';
import { AdminInvitesTable } from '@/features/staff/AdminInvitesTable';
import { InviteAdminModal } from '@/features/staff/InviteAdminModal';
import { invitesApi } from '@/features/staff/invitesApi';
import { RolesPermissionsTab } from '@/features/staff/RolesPermissionsTab';
import { UsersTab } from '@/features/staff/UsersTab';
import { usePageTitle } from '@/hooks/usePageTitle';

type StaffTab = 'users' | 'invites' | 'roles';

export function StaffPage() {
  usePageTitle('Staff');

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<StaffTab>('users');
  const [isInviteOpen, setInviteOpen] = useState(false);

  const adminsQuery = useApiQuery((signal) => invitesApi.listAdmins(signal), 'staff-admins');
  const invitesQuery = useApiQuery((signal) => invitesApi.listInvites(signal), 'staff-invites');

  const openInvite = () => setInviteOpen(true);

  const handleInvited = (invite: AdminInvite) => {
    showToast(`Invitation sent to ${invite.email}`, { title: 'Invitation sent' });
    invitesQuery.refetch();
    setActiveTab('invites');
  };

  const tabs: TabItem<StaffTab>[] = [
    { id: 'users', label: 'Users', icon: UsersThreeIcon, count: adminsQuery.data?.length },
    {
      id: 'invites',
      label: 'Invitations',
      icon: EnvelopeSimpleIcon,
      count: invitesQuery.data?.filter((invite) => invite.status === 'pending').length,
    },
    { id: 'roles', label: 'Roles & permissions', icon: ShieldCheckIcon },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff"
        description="See who has access, invite your team, and control what each role can do."
        actions={
          <Button variant="primary" icon={UserPlusIcon} onClick={openInvite}>
            Invite user
          </Button>
        }
      />

      <Tabs label="Staff sections" tabs={tabs} active={activeTab} onChange={setActiveTab}>
        {activeTab === 'users' && <UsersTab query={adminsQuery} onInvite={openInvite} />}

        {activeTab === 'invites' && (
          <QueryState
            query={invitesQuery}
            loadingLabel="Loading invitations"
            errorTitle="Couldn't load invitations"
            isEmpty={(invites) => invites.length === 0}
            empty={
              <EmptyState
                icon={EnvelopeSimpleIcon}
                title="No invitations yet"
                description="Invite someone and you can track their invitation here until they accept it."
                action={
                  <Button variant="primary" icon={UserPlusIcon} onClick={openInvite}>
                    Invite user
                  </Button>
                }
              />
            }
          >
            {(invites) => (
              <AdminInvitesTable
                invites={invites}
                isRefreshing={invitesQuery.isLoading}
                onChanged={invitesQuery.refetch}
              />
            )}
          </QueryState>
        )}

        {activeTab === 'roles' && <RolesPermissionsTab />}
      </Tabs>

      <InviteAdminModal isOpen={isInviteOpen} onClose={() => setInviteOpen(false)} onInvited={handleInvited} />
    </div>
  );
}
