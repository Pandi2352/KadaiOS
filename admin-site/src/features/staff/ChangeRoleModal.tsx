import { STAFF_ROLE_DEFINITIONS, type StaffRole, type UserProfile } from '@kadai/shared';
import { Button, getErrorMessage, useToast } from '@kadai/ui';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { invitesApi } from './invitesApi';
import { RoleSelectField } from './RoleSelectField';

interface ChangeRoleModalProps {
  /** The person whose role is changing. The modal is open while this is set. */
  user: UserProfile | null;
  onClose: () => void;
  onRoleChanged: () => void;
}

export function ChangeRoleModal({ user, onClose, onRoleChanged }: ChangeRoleModalProps) {
  const { showToast } = useToast();
  const [pickedRole, setPickedRole] = useState<StaffRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentRole: StaffRole = user?.staffRole ?? 'admin';
  const role = pickedRole ?? currentRole;

  const handleClose = () => {
    setPickedRole(null);
    onClose();
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await invitesApi.updateStaffRole(user.id, role);
      showToast(`${user.name} is now ${STAFF_ROLE_DEFINITIONS[role].name}`, { title: 'Role changed' });
      onRoleChanged();
      handleClose();
    } catch (error) {
      showToast(getErrorMessage(error), { tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={handleClose}
      title="Change role"
      description={user ? `For ${user.name} (${user.email})` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={handleSave} disabled={role === currentRole}>
            Save role
          </Button>
        </>
      }
    >
      <RoleSelectField label="Role" value={role} onChange={setPickedRole} />
    </Modal>
  );
}
