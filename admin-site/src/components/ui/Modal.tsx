import { XIcon } from '@phosphor-icons/react';
import { type ReactNode, useId } from 'react';
import { cn, IconButton } from '@kadai/ui';
import { Dialog } from './Dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Usually the action buttons. Stays visible while the body scrolls. */
  footer?: ReactNode;
  size?: 'sm' | 'md';
  role?: 'dialog' | 'alertdialog';
  children?: ReactNode;
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg' };

/** Content only mounts while open, so its state resets each time. */
export function Modal({ isOpen, onClose, title, description, footer, size = 'md', role, children }: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn('my-auto', SIZES[size])}
    >
      {isOpen && (
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-popup-line p-4 pb-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton icon={XIcon} label="Close" className="-mt-1 -mr-1" onClick={onClose} />
          </header>
          {children && <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>}
          {footer && <footer className="flex justify-end gap-2 border-t border-popup-line p-3">{footer}</footer>}
        </div>
      )}
    </Dialog>
  );
}
