import { useEffect } from 'react';
import { useToast } from '../components/toast/ToastContext';
import { useAuth } from './AuthProvider';

/** Explains why someone was sent to log in again. Place it once, inside both AuthProvider and ToastProvider. */
export function SessionEndedNotice() {
  const { onSessionEnded } = useAuth();
  const { showToast } = useToast();

  useEffect(
    () =>
      onSessionEnded(() => {
        showToast('Your session has ended. Please log in again.', { title: 'Session ended', tone: 'info' });
      }),
    [onSessionEnded, showToast],
  );

  return null;
}
