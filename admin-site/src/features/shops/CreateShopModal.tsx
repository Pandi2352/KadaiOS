import type { Shop } from '@kadai/shared';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { ShopForm } from './ShopForm';

interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (shop: Shop) => void;
}

export function CreateShopModal({ isOpen, onClose, onCreated }: CreateShopModalProps) {
  const formId = useId();
  const [isDirty, setDirty] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isConfirmingDiscard, setConfirmingDiscard] = useState(false);

  const closeNow = () => {
    setConfirmingDiscard(false);
    setDirty(false);
    onClose();
  };

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty) setConfirmingDiscard(true);
    else closeNow();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        title="Add a shop"
        footer={
          <>
            <Button variant="outline" disabled={isSubmitting} onClick={requestClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form={formId} isLoading={isSubmitting}>
              Add shop
            </Button>
          </>
        }
      >
        <ShopForm
          id={formId}
          onDirtyChange={setDirty}
          onSubmittingChange={setSubmitting}
          onCreated={(shop) => {
            closeNow();
            onCreated(shop);
          }}
        />
      </Modal>
      <ConfirmDialog
        isOpen={isConfirmingDiscard}
        title="Discard this shop?"
        description="The details you entered will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        confirmVariant="danger"
        onConfirm={closeNow}
        onCancel={() => setConfirmingDiscard(false)}
      />
    </>
  );
}
