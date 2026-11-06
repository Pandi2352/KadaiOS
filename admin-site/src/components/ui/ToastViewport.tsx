import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Toast } from '@/context/ToastContext';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

const AUTO_DISMISS_MS = 5000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const isError = toast.tone === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;

  useEffect(() => {
    // Errors stay until they are closed, so they can't be missed.
    if (isError) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [isError, onDismiss, toast.id]);

  return (
    <li
      role={isError ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-md border bg-surface p-2 pl-3',
        isError ? 'border-danger' : 'border-brand',
      )}
    >
      <Icon size={18} aria-hidden className={cn('mt-2 shrink-0', isError ? 'text-danger' : 'text-brand')} />
      <p className="min-w-0 flex-1 py-1.5">{toast.message}</p>
      <IconButton icon={X} label="Dismiss" onClick={() => onDismiss(toast.id)} />
    </li>
  );
}

export function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <ul
      aria-label="Notifications"
      className="fixed right-4 bottom-4 left-4 z-70 flex flex-col gap-2 empty:hidden sm:left-auto sm:w-96"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </ul>
  );
}
