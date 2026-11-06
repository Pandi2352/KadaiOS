import { type RefObject, useEffect } from 'react';

export type DismissReason = 'outside' | 'escape';

/** Calls onDismiss on a press outside all the given elements, or on Escape. */
export function useDismiss(
  refs: RefObject<HTMLElement | null>[],
  onDismiss: (reason: DismissReason) => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const handlePointer = (event: PointerEvent) => {
      const isInside = refs.some((ref) => ref.current?.contains(event.target as Node));
      if (!isInside) onDismiss('outside');
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss('escape');
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [refs, onDismiss, enabled]);
}
