export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

export interface TooltipPlacement {
  side: TooltipSide;
  left: number;
  top: number;
  /** Where the arrow points, measured along the tooltip's edge from its start. */
  arrowOffset: number;
}

/** Leaves room for the arrow between the tooltip and what it describes. */
const GAP = 8;
const VIEWPORT_MARGIN = 8;
/** Keeps the arrow away from the tooltip's rounded corners. */
const ARROW_INSET = 10;

const OPPOSITE: Record<TooltipSide, TooltipSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));

const fits = (side: TooltipSide, anchor: Box, tooltip: Size, viewport: Size): boolean => {
  if (side === 'top') return anchor.top - GAP - tooltip.height >= VIEWPORT_MARGIN;
  if (side === 'bottom') return anchor.top + anchor.height + GAP + tooltip.height <= viewport.height - VIEWPORT_MARGIN;
  if (side === 'left') return anchor.left - GAP - tooltip.width >= VIEWPORT_MARGIN;
  return anchor.left + anchor.width + GAP + tooltip.width <= viewport.width - VIEWPORT_MARGIN;
};

/**
 * Places a tooltip beside its anchor. It flips when there's no room, slides to stay on
 * screen, and the arrow keeps pointing at the anchor's centre even after sliding.
 */
export function positionTooltip(anchor: Box, tooltip: Size, preferred: TooltipSide, viewport: Size): TooltipPlacement {
  const side =
    !fits(preferred, anchor, tooltip, viewport) && fits(OPPOSITE[preferred], anchor, tooltip, viewport)
      ? OPPOSITE[preferred]
      : preferred;
  const centerX = anchor.left + anchor.width / 2;
  const centerY = anchor.top + anchor.height / 2;

  if (side === 'top' || side === 'bottom') {
    const left = clamp(centerX - tooltip.width / 2, VIEWPORT_MARGIN, viewport.width - tooltip.width - VIEWPORT_MARGIN);
    return {
      side,
      left,
      top: side === 'top' ? anchor.top - GAP - tooltip.height : anchor.top + anchor.height + GAP,
      arrowOffset: clamp(centerX - left, ARROW_INSET, tooltip.width - ARROW_INSET),
    };
  }

  const top = clamp(centerY - tooltip.height / 2, VIEWPORT_MARGIN, viewport.height - tooltip.height - VIEWPORT_MARGIN);
  return {
    side,
    left: side === 'left' ? anchor.left - GAP - tooltip.width : anchor.left + anchor.width + GAP,
    top,
    arrowOffset: clamp(centerY - top, ARROW_INSET, tooltip.height - ARROW_INSET),
  };
}

/** Half the arrow's width. The rotated side arrows are shifted by this so their base still touches the edge. */
const ARROW_HALF_LENGTH = 3;

/** The arrow is drawn pointing down, so each side only needs its position and rotation. */
export function arrowStyle({ side, arrowOffset }: TooltipPlacement): Partial<CSSStyleDeclaration> {
  const offset = `${arrowOffset}px`;
  if (side === 'top') return { top: '100%', left: offset, transform: 'translateX(-50%)' };
  if (side === 'bottom') return { bottom: '100%', left: offset, transform: 'translateX(-50%) rotate(180deg)' };
  if (side === 'left') {
    return { left: '100%', top: offset, transform: `translate(-${ARROW_HALF_LENGTH}px, -50%) rotate(-90deg)` };
  }
  return { right: '100%', top: offset, transform: `translate(${ARROW_HALF_LENGTH}px, -50%) rotate(90deg)` };
}

/** The small slide towards the anchor as the tooltip appears. */
export const ENTER_OFFSET: Record<TooltipSide, [string, string]> = {
  top: ['0px', '4px'],
  bottom: ['0px', '-4px'],
  left: ['4px', '0px'],
  right: ['-4px', '0px'],
};
