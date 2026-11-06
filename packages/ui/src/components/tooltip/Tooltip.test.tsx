import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

const hover = (element: Element, pointerType = 'mouse') => {
  fireEvent.pointerOver(element, { pointerType });
  act(() => vi.advanceTimersByTime(1000));
};

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (props = {}) => {
    render(
      <Tooltip label="Notifications" {...props}>
        <button type="button">Bell</button>
      </Tooltip>,
    );
    return screen.getByRole('button', { name: 'Bell' });
  };

  it('stays hidden until the mouse has rested on the control', () => {
    const button = setup();
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();

    fireEvent.pointerOver(button, { pointerType: 'mouse' });
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('tooltip', { hidden: true }).textContent).toContain('Notifications');
  });

  it('does not appear for touch, so a tap never leaves it stuck', () => {
    hover(setup(), 'touch');
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
  });

  it('hides when the mouse leaves', () => {
    const button = setup();
    hover(button);
    fireEvent.pointerOut(button, { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
  });

  it('stays open when the mouse moves onto it', () => {
    const button = setup();
    hover(button);
    fireEvent.pointerOut(button, { pointerType: 'mouse' });
    fireEvent.pointerOver(screen.getByRole('tooltip', { hidden: true }), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('tooltip', { hidden: true })).toBeTruthy();
  });

  it('hides on Escape, on press and on scroll', () => {
    const button = setup();

    hover(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();

    hover(button);
    fireEvent.pointerDown(button);
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();

    hover(button);
    fireEvent.scroll(window);
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
  });

  it('only ever shows one at a time', () => {
    render(
      <>
        <Tooltip label="First">
          <button type="button">One</button>
        </Tooltip>
        <Tooltip label="Second">
          <button type="button">Two</button>
        </Tooltip>
      </>,
    );
    hover(screen.getByRole('button', { name: 'One' }));
    hover(screen.getByRole('button', { name: 'Two' }));

    expect(screen.getAllByRole('tooltip', { hidden: true })).toHaveLength(1);
    expect(screen.getByRole('tooltip', { hidden: true }).textContent).toContain('Second');
  });

  it('shows nothing while disabled', () => {
    hover(setup({ disabled: true }));
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
  });

  it('shows a keyboard shortcut as a keycap', () => {
    hover(setup({ shortcut: 'Ctrl K' }));
    expect(screen.getByRole('tooltip', { hidden: true }).querySelector('kbd')?.textContent).toBe('Ctrl K');
  });

  it('describes the control while open, and cleans up afterwards', () => {
    const button = setup();
    hover(button);
    expect(button.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip', { hidden: true }).id);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button.getAttribute('aria-describedby')).toBeNull();
  });

  it('does not repeat a label the control already has', () => {
    render(
      <Tooltip label="Close">
        <button type="button" aria-label="Close" />
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Close' });
    hover(button);
    expect(screen.getByRole('tooltip', { hidden: true })).toBeTruthy();
    expect(button.getAttribute('aria-describedby')).toBeNull();
  });
});
