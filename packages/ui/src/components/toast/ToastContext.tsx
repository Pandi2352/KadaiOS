import { generateUuid } from '@kadai/shared';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { createStrictContext } from '../../createStrictContext';
import type { ToastTone } from './toastTones';
import { ToastViewport } from './ToastViewport';

const MAX_TOASTS = 4;

export interface Toast {
  id: string;
  message: string;
  title?: string;
  tone: ToastTone;
}

export interface ToastOptions {
  /** Defaults to success. Errors stay until closed, so they can't be missed. */
  tone?: ToastTone;
  /** A short bold line above the message. */
  title?: string;
}

interface ToastValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const [Provider, useToast] = createStrictContext<ToastValue>('Toast');

export { useToast };

/** Wrap the app above the router, so a toast stays on screen when the page changes after an action. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, { tone = 'success', title }: ToastOptions = {}) => {
    setToasts((current) => {
      // A repeated click shouldn't stack the same message.
      if (current.some((toast) => toast.message === message && toast.tone === tone)) return current;
      return [...current, { id: generateUuid(), message, title, tone }].slice(-MAX_TOASTS);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onRemove={remove} />
    </Provider>
  );
}
