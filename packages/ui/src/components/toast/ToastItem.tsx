import { XIcon } from '@phosphor-icons/react';
import { type AnimationEvent, useState } from 'react';
import { cn } from '../../cn';
import { IconButton } from '../IconButton';
import type { Toast } from './ToastContext';
import { TOAST_TONES } from './toastTones';

const AUTO_DISMISS_MS = 5000;

const prefersReducedMotion = () => !window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches;

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isLeaving, setLeaving] = useState(false);
  const { icon: Icon, chip, bar } = TOAST_TONES[toast.tone];
  const isError = toast.tone === 'error';

  const dismiss = () => {
    // With animations off there's no exit animation to wait for.
    if (prefersReducedMotion()) onRemove(toast.id);
    else setLeaving(true);
  };

  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName.includes('toast-out')) onRemove(toast.id);
  };

  return (
    <li
      role={isError ? 'alert' : 'status'}
      onAnimationEnd={handleAnimationEnd}
      className={cn(
        'group pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-md border popup-surface p-3 pr-2',
        isLeaving ? 'motion-safe:animate-toast-out' : 'motion-safe:animate-toast-in',
      )}
    >
      <span aria-hidden className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', chip)}>
        <Icon size={20} weight="fill" />
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        {toast.title && <p className="font-semibold text-ink">{toast.title}</p>}
        <p className={cn('wrap-break-word', toast.title ? 'text-muted' : 'text-ink')}>{toast.message}</p>
      </div>
      <IconButton icon={XIcon} label="Dismiss" className="-mt-1" onClick={dismiss} />
      {/* The bar is the timer: when it finishes the toast leaves, so pausing it pauses the countdown too. */}
      {!isError && (
        <span
          aria-hidden
          style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }}
          onAnimationEnd={(event) => {
            event.stopPropagation();
            dismiss();
          }}
          className={cn(
            'absolute inset-x-0 bottom-0 h-0.5 origin-left animate-toast-countdown group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]',
            bar,
          )}
        />
      )}
    </li>
  );
}
