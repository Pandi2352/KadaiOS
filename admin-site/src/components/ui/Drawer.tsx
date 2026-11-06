import { IconButton } from '@kadai/ui';
import { XIcon } from '@phosphor-icons/react';
import { type ReactNode, useId } from 'react';
import { Dialog } from './Dialog';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

/** A panel that slides over the right side of the page. Content only mounts while open. */
export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const titleId = `${useId()}-title`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      className="my-0 mr-0 ml-auto h-dvh max-h-dvh max-w-md"
    >
      {isOpen && (
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-popup-line py-2 pr-2 pl-4">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <IconButton icon={XIcon} label="Close" onClick={onClose} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      )}
    </Dialog>
  );
}
