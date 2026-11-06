import { type MouseEvent, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { type DismissReason, Tooltip, useDismiss } from '@kadai/ui';

interface DropdownProps {
  /** Accessible name for the trigger button. */
  label: string;
  /** Shown on hover. Defaults to the label. Use it when the label is too long for a tooltip. */
  tooltip?: string;
  trigger: ReactNode;
  triggerClassName: string;
  children: ReactNode;
}

/**
 * On phones the panel spans the positioned parent (the navbar) so it can't run off screen.
 * From the sm breakpoint it hangs off the trigger's right edge.
 */
export function Dropdown({ label, tooltip = label, trigger, triggerClassName, children }: DropdownProps) {
  const [isOpen, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refs = useMemo(() => [rootRef], []);

  const handleDismiss = useCallback((reason: DismissReason) => {
    setOpen(false);
    if (reason === 'escape') triggerRef.current?.focus();
  }, []);

  useDismiss(refs, handleDismiss, isOpen);

  const closeOnSelect = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) setOpen(false);
  };

  return (
    <div ref={rootRef} className="sm:relative">
      <Tooltip label={tooltip} side="bottom" disabled={isOpen}>
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-expanded={isOpen}
          className={triggerClassName}
          onClick={() => setOpen(!isOpen)}
        >
          {trigger}
        </button>
      </Tooltip>
      {isOpen && (
        <div
          onClick={closeOnSelect}
          className="absolute top-full right-2 left-2 z-30 mt-1 rounded-md border border-line bg-surface p-1 sm:right-0 sm:left-auto sm:w-64"
        >
          {children}
        </div>
      )}
    </div>
  );
}
