import { type AdminInvite, formatShopDate } from '@kadai/shared';
import { Button, useToast } from '@kadai/ui';
import { ArrowClockwiseIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table, type TableColumn } from '@/components/ui/Table';
import { invitesApi } from './invitesApi';

interface AdminInvitesTableProps {
  invites: AdminInvite[];
  isRefreshing: boolean;
  onChanged: () => void;
}

export function AdminInvitesTable({ invites, isRefreshing, onChanged }: AdminInvitesTableProps) {
  const { showToast } = useToast();
  const [revoking, setRevoking] = useState<AdminInvite | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleResend = async (invite: AdminInvite) => {
    setResendingId(invite.id);
    try {
      await invitesApi.resendInvite(invite.id);
      showToast(`Invitation resent to ${invite.email}`);
      onChanged();
    } catch {
      showToast('Could not resend invitation. Check connection.', { tone: 'error' });
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
    } catch {
      showToast('Could not revoke invitation. Check connection.', { tone: 'error' });
    } finally {
      setIsRevoking(false);
    }
  };

  const columns: TableColumn<AdminInvite>[] = [
    {
      key: 'email',
      header: 'Invited Email',
      render: (invite) => <span className="font-medium">{invite.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (invite) => {
        if (invite.status === 'accepted') {
          return (
            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Accepted
            </span>
          );
        }
        if (invite.status === 'expired') {
          return (
            <span className="inline-flex items-center rounded-md bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-muted">
              Expired
            </span>
          );
        }
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
            Pending
          </span>
        );
      },
    },
    {
      key: 'invitedBy',
      header: 'Invited By',
      render: (invite) => invite.invitedByName ?? 'Admin',
    },
    {
      key: 'createdAt',
      header: 'Sent On',
      render: (invite) => formatShopDate(new Date(invite.createdAt)),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (invite) => formatShopDate(new Date(invite.expiresAt)),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (invite) => {
        if (invite.status === 'accepted') {
          return <span className="text-xs text-muted">Claimed</span>;
        }

        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              icon={ArrowClockwiseIcon}
              isLoading={resendingId === invite.id}
              onClick={() => handleResend(invite)}
            >
              Resend
            </Button>
            <Button variant="ghost" icon={TrashIcon} onClick={() => setRevoking(invite)}>
              Revoke
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        caption="Admin Invitations"
        columns={columns}
        rows={invites}
        rowKey={(invite) => invite.id}
        isRefreshing={isRefreshing}
      />
      <ConfirmDialog
        isOpen={Boolean(revoking)}
        title="Revoke invitation"
        description={`Are you sure you want to revoke the administrator invitation for ${revoking?.email}? The link will no longer be valid.`}
        confirmLabel="Revoke invite"
        cancelLabel="Keep invite"
        confirmVariant="danger"
        isLoading={isRevoking}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevoking(null)}
      />
    </>
  );
}
