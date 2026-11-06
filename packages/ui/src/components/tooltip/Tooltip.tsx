import { type ReactNode, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { arrowStyle, ENTER_OFFSET, positionTooltip, type TooltipSide } from './positionTooltip';
import { useTooltip } from './useTooltip';

interface TooltipProps {
  label: string;
  /** Preferred side. It flips when there's no room. */
  side?: TooltipSide;
  /** A keyboard shortcut shown as a keycap, such as "Ctrl K". */
  shortcut?: string;
  /** Turns it off without changing the page's structure, such as while a menu is open. */
  disabled?: boolean;
  /** One element, usually a button. */
  children: ReactNode;
}

/**
 * The common tooltip. It renders in the browser's top layer through the popover API, so
 * scrolling areas can't clip it and modals can't cover it. The wrapper uses display: contents,
 * so it never changes the layout of whatever it wraps.
 */
export function Tooltip({ label, side = 'top', shortcut, disabled = false, children }: TooltipProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isOpen, triggerProps, bubbleProps } = useTooltip();
  const isVisible = isOpen && !disabled;

  useLayoutEffect(() => {
    const anchor = wrapperRef.current?.firstElementChild;
    const bubble = bubbleRef.current;
    const arrow = arrowRef.current;
    if (!isVisible || !anchor || !bubble || !arrow) return;

    bubble.showPopover?.();

    const placement = positionTooltip(anchor.getBoundingClientRect(), bubble.getBoundingClientRect(), side, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const [offsetX, offsetY] = ENTER_OFFSET[placement.side];

    bubble.style.left = `${placement.left}px`;
    bubble.style.top = `${placement.top}px`;
    bubble.style.setProperty('--tooltip-from-x', offsetX);
    bubble.style.setProperty('--tooltip-from-y', offsetY);
    Object.assign(arrow.style, arrowStyle(placement));

    // A control already named by its aria-label doesn't need the same words read twice.
    const needsDescription = anchor.getAttribute('aria-label') !== label;
    if (needsDescription) anchor.setAttribute('aria-describedby', id);
    return () => {
      if (needsDescription) anchor.removeAttribute('aria-describedby');
    };
  }, [isVisible, label, side, id]);

  return (
    <div ref={wrapperRef} className="contents" {...triggerProps}>
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            popover="manual"
            {...bubbleProps}
            className="fixed inset-auto m-0 flex max-w-60 items-center gap-2 overflow-visible rounded-md border-0 bg-tooltip px-2 py-1 text-xs font-medium text-on-brand motion-safe:animate-tooltip-in"
          >
            {label}
            {shortcut && (
              <kbd className="rounded-md border border-on-brand/30 px-1 font-sans text-[0.6875rem] font-medium whitespace-nowrap">
                {shortcut}
              </kbd>
            )}
            <svg ref={arrowRef} width="12" height="6" viewBox="0 0 12 6" aria-hidden className="absolute fill-tooltip">
              <path d="M0 0h12L7.4 5.3a1.9 1.9 0 0 1-2.8 0L0 0Z" />
            </svg>
          </div>,
          document.body,
        )}
    </div>
  );
}
