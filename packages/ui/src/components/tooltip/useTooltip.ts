import { type FocusEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

const SHOW_DELAY_MS = 350;
const HIDE_DELAY_MS = 80;
/** Moving between nearby controls shows the next tooltip straight away, like a toolbar. */
const SKIP_DELAY_WINDOW_MS = 400;

/** Shared by every tooltip, because only one should ever be showing. */
let closeActive: (() => void) | null = null;
let lastHiddenAt = 0;

const hoverDelay = () => (closeActive || Date.now() - lastHiddenAt < SKIP_DELAY_WINDOW_MS ? 0 : SHOW_DELAY_MS);

/** When a tooltip shows and hides. Mouse hover and keyboard focus only, so a tap doesn't leave one stuck on a phone. */
export function useTooltip() {
  const [isOpen, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const clearTimer = () => window.clearTimeout(timer.current);

  const hideNow = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, []);

  const show = (delay: number) => {
    clearTimer();
    timer.current = window.setTimeout(() => {
      closeActive?.();
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    clearTimer();
    timer.current = window.setTimeout(hideNow, HIDE_DELAY_MS);
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!isOpen) return;
    closeActive = hideNow;

    // Escape dismisses it without moving focus, and scrolling would leave it pointing at nothing.
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideNow();
    };
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', hideNow, true);
    window.addEventListener('resize', hideNow);

    return () => {
      if (closeActive === hideNow) closeActive = null;
      lastHiddenAt = Date.now();
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', hideNow, true);
      window.removeEventListener('resize', hideNow);
    };
  }, [isOpen, hideNow]);

  const triggerProps = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'mouse') show(hoverDelay());
    },
    onPointerLeave: hide,
    onPointerDown: hideNow,
    onFocus: (event: FocusEvent) => {
      if (event.target.matches(':focus-visible')) show(0);
    },
    onBlur: hideNow,
  };

  // Moving onto the tooltip keeps it open, so its text can be read with a screen magnifier.
  const bubbleProps = { onPointerEnter: clearTimer, onPointerLeave: hide };

  return { isOpen, triggerProps, bubbleProps };
}
