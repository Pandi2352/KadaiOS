import { type CSSProperties, type RefObject, useCallback, useEffect, useState } from 'react';

const GAP = 4;
const VIEWPORT_MARGIN = 8;

/**
 * Fixed position beside an element. Fixed positioning also escapes scrolling parents
 * and works inside native dialogs, where a portal to body would sit behind the dialog.
 * It opens upward when there isn't enough room below.
 */
export function useFloatingPosition(anchorRef: RefObject<HTMLElement | null>, isActive: boolean, maxHeight = 280) {
  const [style, setStyle] = useState<CSSProperties>({});

  const update = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;

    const below = window.innerHeight - anchor.bottom - GAP - VIEWPORT_MARGIN;
    const above = anchor.top - GAP - VIEWPORT_MARGIN;
    const opensUp = below < maxHeight && above > below;

    setStyle({
      left: anchor.left,
      width: anchor.width,
      maxHeight: Math.min(maxHeight, opensUp ? above : below),
      ...(opensUp ? { bottom: window.innerHeight - anchor.top + GAP } : { top: anchor.bottom + GAP }),
    });
  }, [anchorRef, maxHeight]);

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isActive, update]);

  return { style, update };
}
