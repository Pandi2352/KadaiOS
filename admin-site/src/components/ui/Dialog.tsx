import { type MouseEvent, type ReactNode, type SyntheticEvent, useEffect, useRef } from 'react';
import { cn } from '@kadai/ui';

interface DialogProps {
  isOpen: boolean;
  /** Called on Escape and on a click outside. The parent decides whether to close. */
  onClose: () => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: 'dialog' | 'alertdialog';
  className?: string;
  children: ReactNode;
}

/**
 * The native dialog gives focus trapping, the top layer and focus return for free.
 * Modal and the command palette are built on this. Add data-autofocus to focus an element on open.
 */
export function Dialog({ isOpen, onClose, role, className, children, ...labels }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOutside = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleCancel = (event: SyntheticEvent) => {
    event.preventDefault();
    onClose();
  };

  // Comparing the press and release means dragging text out of a field doesn't close the dialog.
  const handleMouseDown = (event: MouseEvent) => {
    pressStartedOutside.current = event.target === dialogRef.current;
  };

  const handleClick = (event: MouseEvent) => {
    if (pressStartedOutside.current && event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role={role}
      onCancel={handleCancel}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn('mx-auto w-[calc(100vw-2rem)] rounded-md border border-line bg-surface text-ink', className)}
      {...labels}
    >
      {children}
    </dialog>
  );
}
