import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ToastProvider, useToast, type ToastOptions } from './ToastContext';

function Trigger({ message, options }: { message: string; options?: ToastOptions }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, options)}>Show {message}</button>;
}

const setup = (...items: { message: string; options?: ToastOptions }[]) =>
  render(
    <ToastProvider>
      {items.map((item) => (
        <Trigger key={item.message} {...item} />
      ))}
    </ToastProvider>,
  );

const show = (message: string) => userEvent.click(screen.getByRole('button', { name: `Show ${message}` }));
const toasts = () => [...document.querySelectorAll('[popover] li')];
const text = (element: Element) => element.textContent;

describe('toasts', () => {
  it('shows the message and title', async () => {
    setup({ message: 'Welcome back', options: { title: 'Logged in' } });
    await show('Welcome back');

    expect(text(toasts()[0])).toContain('Logged in');
    expect(text(toasts()[0])).toContain('Welcome back');
  });

  it('announces errors urgently and everything else politely', async () => {
    setup({ message: 'Saved' }, { message: 'Failed', options: { tone: 'error' } });
    await show('Saved');
    await show('Failed');

    expect(screen.getByRole('status', { hidden: true }).textContent).toContain('Saved');
    expect(screen.getByRole('alert', { hidden: true }).textContent).toContain('Failed');
  });

  it('closes with the dismiss button', async () => {
    setup({ message: 'Saved' });
    await show('Saved');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss', hidden: true }));
    expect(toasts()).toHaveLength(0);
  });

  // jsdom doesn't run CSS animations, so browser checks cover the toast actually leaving.
  it('runs a five second countdown', async () => {
    setup({ message: 'Saved' });
    await show('Saved');

    const bar = toasts()[0].querySelector<HTMLElement>('[class*="animate-toast-countdown"]');
    expect(bar?.style.animationDuration).toBe('5000ms');
  });

  it('gives errors no countdown, so they stay until closed', async () => {
    setup({ message: 'Failed', options: { tone: 'error' } });
    await show('Failed');

    expect(toasts()[0].querySelector('[class*="animate-toast-countdown"]')).toBeNull();
  });

  it('does not stack the same message twice', async () => {
    setup({ message: 'Saved' });
    await show('Saved');
    await show('Saved');

    expect(toasts()).toHaveLength(1);
  });

  it('keeps at most four, dropping the oldest', async () => {
    const messages = ['One', 'Two', 'Three', 'Four', 'Five'];
    setup(...messages.map((message) => ({ message })));
    for (const message of messages) await show(message);

    expect(toasts()).toHaveLength(4);
    expect(toasts().map(text).join()).not.toContain('One');
    expect(text(toasts()[3])).toContain('Five');
  });
});
