import type { AdminInvite, StaffRole } from '@kadai/shared';
import { Button, EmailField, fieldRules, FormAlert, useForm } from '@kadai/ui';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useId, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { invitesApi } from './invitesApi';
import { RoleSelectField } from './RoleSelectField';

const DEFAULT_ROLE: StaffRole = 'admin';
const INITIAL_VALUES = { email: '' };
const RULES = { email: fieldRules.email('Email') };

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: (invite: AdminInvite) => void;
}

export function InviteAdminModal({ isOpen, onClose, onInvited }: InviteAdminModalProps) {
  const formId = useId();
  const [staffRole, setStaffRole] = useState<StaffRole>(DEFAULT_ROLE);

  const { field, handleSubmit, formError, isSubmitting, reset } = useForm({
    initialValues: INITIAL_VALUES,
    rules: RULES,
    onSubmit: async ({ email }) => {
      const invite = await invitesApi.createInvite({ email, staffRole });
      onInvited(invite);
      handleClose();
    },
  });

  function handleClose() {
    reset();
    setStaffRole(DEFAULT_ROLE);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite a team member"
      description="They'll get an email with a link to set up their account. The link works for 48 hours."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" icon={PaperPlaneTiltIcon} type="submit" form={formId} isLoading={isSubmitting}>
            Send invitation
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormAlert message={formError} />
        <EmailField {...field('email')} label="Email" placeholder="colleague@example.com" data-autofocus />
        <RoleSelectField label="Role" value={staffRole} onChange={setStaffRole} />
      </form>
    </Modal>
  );
}
