import { Button, type ButtonVariant } from '@kadai/ui';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  /** Name the action, such as "Discard changes", rather than "OK". */
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      role="alertdialog"
      footer={
        <>
          <Button variant="outline" data-autofocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
