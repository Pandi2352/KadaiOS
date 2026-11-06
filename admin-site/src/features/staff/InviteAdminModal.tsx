import type { AdminInvite } from '@kadai/shared';
import { Button, EmailField, fieldRules, FormAlert, useForm } from '@kadai/ui';
import { useId } from 'react';
import { Modal } from '@/components/ui/Modal';
import { invitesApi } from './invitesApi';

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: (invite: AdminInvite) => void;
}

interface InviteFormValues {
  email: string;
}

const INITIAL_VALUES: InviteFormValues = {
  email: '',
};

const RULES = {
  email: fieldRules.email('Colleague email'),
};

export function InviteAdminModal({ isOpen, onClose, onInvited }: InviteAdminModalProps) {
  const formId = useId();

  const handleSubmitInvite = async (values: InviteFormValues) => {
    const invite = await invitesApi.createInvite({ email: values.email });
    onInvited(invite);
    onClose();
  };

  const { field, handleSubmit, formError, isSubmitting } = useForm({
    initialValues: INITIAL_VALUES,
    rules: RULES,
    onSubmit: handleSubmitInvite,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite administrator"
      description="An invitation email with a secure setup link will be sent to this email address."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId} isLoading={isSubmitting}>
            Send invitation
          </Button>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormAlert message={formError} />
        <EmailField
          {...field('email')}
          label="Colleague's email address"
          placeholder="colleague@example.com"
          hint="The invitation link will be valid for 48 hours."
          autoFocus
        />
      </form>
    </Modal>
  );
}
