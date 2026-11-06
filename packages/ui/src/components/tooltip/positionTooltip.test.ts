import { describe, expect, it } from 'vitest';
import { arrowStyle, positionTooltip } from './positionTooltip';

const VIEWPORT = { width: 1000, height: 800 };
const TOOLTIP = { width: 100, height: 30 };
const centre = { left: 480, top: 400, width: 40, height: 40 };

describe('positionTooltip', () => {
  it('centres on each preferred side, leaving room for the arrow', () => {
    expect(positionTooltip(centre, TOOLTIP, 'top', VIEWPORT)).toEqual({
      side: 'top',
      left: 450,
      top: 362,
      arrowOffset: 50,
    });
    expect(positionTooltip(centre, TOOLTIP, 'bottom', VIEWPORT)).toEqual({
      side: 'bottom',
      left: 450,
      top: 448,
      arrowOffset: 50,
    });
    expect(positionTooltip(centre, TOOLTIP, 'right', VIEWPORT)).toEqual({
      side: 'right',
      left: 528,
      top: 405,
      arrowOffset: 15,
    });
    expect(positionTooltip(centre, TOOLTIP, 'left', VIEWPORT)).toEqual({
      side: 'left',
      left: 372,
      top: 405,
      arrowOffset: 15,
    });
  });

  it('flips when the preferred side has no room', () => {
    expect(positionTooltip({ ...centre, top: 5 }, TOOLTIP, 'top', VIEWPORT).side).toBe('bottom');
    expect(positionTooltip({ ...centre, top: 770 }, TOOLTIP, 'bottom', VIEWPORT).side).toBe('top');
    expect(positionTooltip({ ...centre, left: 5 }, TOOLTIP, 'left', VIEWPORT).side).toBe('right');
    expect(positionTooltip({ ...centre, left: 950 }, TOOLTIP, 'right', VIEWPORT).side).toBe('left');
  });

  it('stays on the preferred side when neither side fits', () => {
    const tiny = { width: 300, height: 60 };
    expect(positionTooltip({ left: 10, top: 20, width: 20, height: 20 }, TOOLTIP, 'top', tiny).side).toBe('top');
  });

  it('slides to stay on screen, and the arrow keeps pointing at the anchor', () => {
    const atRightEdge = { left: 950, top: 400, width: 40, height: 40 };
    const placement = positionTooltip(atRightEdge, TOOLTIP, 'top', VIEWPORT);

    expect(placement.left + TOOLTIP.width).toBe(VIEWPORT.width - 8);
    expect(placement.left + placement.arrowOffset).toBe(970);
  });

  it('keeps the arrow away from the rounded corners', () => {
    const inCorner = { left: 0, top: 400, width: 8, height: 8 };
    expect(positionTooltip(inCorner, TOOLTIP, 'top', VIEWPORT).arrowOffset).toBe(10);
  });
});

describe('arrowStyle', () => {
  const placement = { left: 0, top: 0, arrowOffset: 20 };

  it('sits on the edge facing the anchor', () => {
    expect(arrowStyle({ ...placement, side: 'top' })).toMatchObject({ top: '100%', left: '20px' });
    expect(arrowStyle({ ...placement, side: 'bottom' })).toMatchObject({ bottom: '100%', left: '20px' });
    expect(arrowStyle({ ...placement, side: 'left' })).toMatchObject({ left: '100%', top: '20px' });
    expect(arrowStyle({ ...placement, side: 'right' })).toMatchObject({ right: '100%', top: '20px' });
  });
});
