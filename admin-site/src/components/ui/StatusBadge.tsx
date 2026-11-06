import { cn } from '@kadai/ui';
import type { ReactNode } from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const DOTS: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-field',
};

/** A coloured dot and a word for a record's state, such as Active or Expired. */
export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className={cn('size-2 shrink-0 rounded-md', DOTS[tone])} />
      {children}
    </span>
  );
}
