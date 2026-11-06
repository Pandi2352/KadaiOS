import { Button, useApiQuery, useToast } from '@kadai/ui';
import { EnvelopeSimpleIcon, ShieldCheckIcon, UserPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import type { AdminInvite } from '@kadai/shared';
import { useState } from 'react';
import { FILL_PAGE } from '@/components/ui/fillStyles';
import { PageHeader } from '@/components/ui/PageHeader';
import { type TabItem, Tabs } from '@/components/ui/Tabs';
import { InviteAdminModal } from '@/features/staff/InviteAdminModal';
import { NO_INVITE_FILTERS } from '@/features/staff/inviteFilters';
import { InvitesTab } from '@/features/staff/InvitesTab';
import { invitesApi } from '@/features/staff/invitesApi';
import { InvitesToolbar } from '@/features/staff/InvitesToolbar';
import { RolesPermissionsTab } from '@/features/staff/RolesPermissionsTab';
import { NO_FILTERS } from '@/features/staff/staffFilters';
import { UsersTab } from '@/features/staff/UsersTab';
import { UsersToolbar } from '@/features/staff/UsersToolbar';
import { useStaffPermissions } from '@/features/staff/useStaffPermissions';
import { useListControls } from '@/hooks/useListControls';
import { usePageTitle } from '@/hooks/usePageTitle';

type StaffTab = 'users' | 'invites' | 'roles';

/** Only the totals are needed for the tab labels, so one row is enough. */
const COUNT_ONLY = { page: 1, limit: 1 };

export function StaffPage() {
  usePageTitle('Staff');

  const { showToast } = useToast();
  const { canInvite } = useStaffPermissions();
  const [activeTab, setActiveTab] = useState<StaffTab>('users');
  const [isInviteOpen, setInviteOpen] = useState(false);
  const users = useListControls(NO_FILTERS);
  const invites = useListControls(NO_INVITE_FILTERS);
  // Changing this reloads the Invitations list from its first page, so a new invitation is in view.
  const [invitesVersion, setInvitesVersion] = useState(0);

  const adminCount = useApiQuery((signal) => invitesApi.listAdmins(COUNT_ONLY, signal), 'staff-count');
  const pendingCount = useApiQuery(
    (signal) => invitesApi.listInvites({ ...COUNT_ONLY, status: 'pending' }, signal),
    'staff-pending-count',
  );

  const openInvite = () => setInviteOpen(true);

  const handleInvited = (invite: AdminInvite) => {
    showToast(`Invitation sent to ${invite.email}`, { title: 'Invitation sent' });
    pendingCount.refetch();
    invites.setFilters(NO_INVITE_FILTERS);
    setInvitesVersion((version) => version + 1);
    setActiveTab('invites');
  };

  const tabs: TabItem<StaffTab>[] = [
    { id: 'users', label: 'Users', icon: UsersThreeIcon, count: adminCount.data?.total },
    { id: 'invites', label: 'Invitations', icon: EnvelopeSimpleIcon, count: pendingCount.data?.total },
    { id: 'roles', label: 'Roles & permissions', icon: ShieldCheckIcon },
  ];

  return (
    <>
      <div className={`space-y-4 ${FILL_PAGE}`}>
        <PageHeader
          title="Staff"
          description="See who has access, invite your team, and control what each role can do."
          actions={
            canInvite && (
              <Button variant="primary" icon={UserPlusIcon} onClick={openInvite}>
                Invite user
              </Button>
            )
          }
        />

        <Tabs
          label="Staff sections"
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
          actions={
            <>
              {activeTab === 'users' && <UsersToolbar filters={users.filters} onChange={users.setFilters} />}
              {activeTab === 'invites' && <InvitesToolbar filters={invites.filters} onChange={invites.setFilters} />}
            </>
          }
        >
          {activeTab === 'users' && <UsersTab controls={users} onInvite={openInvite} onChanged={adminCount.refetch} />}
          {activeTab === 'invites' && (
            <InvitesTab
              key={invitesVersion}
              controls={invites}
              onInvite={openInvite}
              onChanged={pendingCount.refetch}
            />
          )}
          {activeTab === 'roles' && <RolesPermissionsTab />}
        </Tabs>
      </div>

      {canInvite && (
        <InviteAdminModal isOpen={isInviteOpen} onClose={() => setInviteOpen(false)} onInvited={handleInvited} />
      )}
    </>
  );
}
