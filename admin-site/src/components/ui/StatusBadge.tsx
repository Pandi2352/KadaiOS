import { cn } from '@kadai/ui';
import type { ReactNode } from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<StatusTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-canvas text-muted',
};

/** A small coloured label for a record's state, such as Active or Expired. */
export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  );
}
