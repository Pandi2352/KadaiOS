import { type AdminInvite, type AdminInviteStatus, formatShopDate } from '@kadai/shared';
import { getErrorMessage, IconButton, useToast } from '@kadai/ui';
import { ArrowClockwiseIcon, EnvelopeSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { type ReactNode, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityCell } from '@/components/ui/DataTable/cells';
import { RowActions } from '@/components/ui/RowActions';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import { invitesApi } from './invitesApi';
import { RoleBadge } from './RoleBadge';
import { useStaffPermissions } from './useStaffPermissions';

const STATUS: Record<AdminInviteStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'success' },
  expired: { label: 'Expired', tone: 'neutral' },
};

function InviteStatusBadge({ status }: { status: AdminInviteStatus }) {
  return <StatusBadge tone={STATUS[status].tone}>{STATUS[status].label}</StatusBadge>;
}

interface AdminInvitesTableProps {
  invites: AdminInvite[];
  isRefreshing: boolean;
  onChanged: () => void;
  emptyState: ReactNode;
  footer: ReactNode;
}

export function AdminInvitesTable({ invites, isRefreshing, onChanged, emptyState, footer }: AdminInvitesTableProps) {
  const { showToast } = useToast();
  const { canInvite, assignableRoles } = useStaffPermissions();
  const [revoking, setRevoking] = useState<AdminInvite | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleResend = async (invite: AdminInvite) => {
    setResendingId(invite.id);
    try {
      await invitesApi.resendInvite(invite.id);
      showToast(`Invitation sent again to ${invite.email}`);
      onChanged();
    } catch (error) {
      showToast(getErrorMessage(error), { tone: 'error' });
    } finally {
      setResendingId(null);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revoking) return;

    setIsRevoking(true);
    try {
      await invitesApi.revokeInvite(revoking.id);
      showToast(`Invitation for ${revoking.email} revoked`);
      setRevoking(null);
      onChanged();
    } catch (error) {
      showToast(getErrorMessage(error), { tone: 'error' });
    } finally {
      setIsRevoking(false);
    }
  };

  const columns: TableColumn<AdminInvite>[] = [
    {
      key: 'email',
      header: 'Email',
      // max-w-0 lets a long email shorten instead of widening the table. Small screens give this column
      // all the spare width. Larger ones cap it, so the other columns spread out instead of bunching up.
      className: 'w-full max-w-0 lg:w-[36%]',
      render: (invite) => (
        <>
          <EntityCell
            title={invite.email}
            subtitle={`Invited by ${invite.invitedByName ?? 'an admin'}`}
            icon={<EnvelopeSimpleIcon size={18} aria-hidden />}
          />
          {/* On phones the status moves here, so the email gets the width it needs. */}
          <div className="mt-1.5 pl-11 sm:hidden">
            <InviteStatusBadge status={invite.status} />
          </div>
        </>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      className: 'hidden sm:table-cell',
      render: (invite) => <RoleBadge role={invite.staffRole} />,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'hidden sm:table-cell',
      render: ({ status }) => <InviteStatusBadge status={status} />,
    },
    {
      key: 'createdAt',
      header: 'Sent',
      className: 'hidden whitespace-nowrap xl:table-cell',
      render: (invite) => <span className="text-muted">{formatShopDate(new Date(invite.createdAt))}</span>,
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      className: 'hidden whitespace-nowrap md:table-cell',
      render: (invite) => <span className="text-muted">{formatShopDate(new Date(invite.expiresAt))}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-28',
      render: (invite) =>
        canInvite &&
        invite.status !== 'accepted' && (
          <RowActions>
            {(!invite.staffRole || assignableRoles.includes(invite.staffRole)) && (
              <IconButton
                icon={ArrowClockwiseIcon}
                label={`Resend invitation to ${invite.email}`}
                disabled={resendingId === invite.id}
                aria-busy={resendingId === invite.id}
                onClick={() => handleResend(invite)}
              />
            )}
            <IconButton
              icon={TrashIcon}
              label={`Revoke invitation for ${invite.email}`}
              onClick={() => setRevoking(invite)}
            />
          </RowActions>
        ),
    },
  ];

  return (
    <>
      <Table
        caption="Invitations"
        columns={columns}
        rows={invites}
        rowKey={(invite) => invite.id}
        isRefreshing={isRefreshing}
        emptyState={emptyState}
        footer={footer}
        fill
      />
      <ConfirmDialog
        isOpen={Boolean(revoking)}
        title="Revoke this invitation?"
        description={`The link sent to ${revoking?.email} will stop working.`}
        confirmLabel="Revoke invitation"
        cancelLabel="Keep invitation"
        confirmVariant="danger"
        isLoading={isRevoking}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevoking(null)}
      />
    </>
  );
}
