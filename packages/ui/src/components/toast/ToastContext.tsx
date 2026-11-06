import { generateUuid } from '@kadai/shared';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { ToastViewport } from './ToastViewport';
import { createStrictContext } from '../../createStrictContext';

export type ToastTone = 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const [Provider, useToast] = createStrictContext<ToastValue>('Toast');

export { useToast };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    setToasts((current) => [...current, { id: generateUuid(), message, tone }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </Provider>
  );
}
