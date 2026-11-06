import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Toast } from './ToastContext';
import { ToastItem } from './ToastItem';

interface ToastViewportProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

/**
 * Stays mounted while empty, so screen readers already know this area when a message arrives.
 * It lives in the browser's top layer, and moves back to the front for each new toast, so an open modal can't cover it.
 */
export function ToastViewport({ toasts, onRemove }: ToastViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.showPopover?.();
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport?.showPopover || toasts.length === 0) return;
    if (viewport.matches(':popover-open')) viewport.hidePopover();
    viewport.showPopover();
  }, [toasts.length]);

  return (
    <div
      ref={viewportRef}
      popover="manual"
      className="pointer-events-none fixed inset-auto right-4 bottom-4 m-0 h-auto w-[calc(100vw-2rem)] overflow-visible border-0 bg-transparent p-0 sm:w-96"
    >
      <ol aria-label="Notifications" aria-live="polite" className="flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </ol>
    </div>
  );
}
