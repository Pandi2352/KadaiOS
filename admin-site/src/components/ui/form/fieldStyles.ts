import { cn } from '@/lib/cn';

/** Shared look for every text-like control, so inputs and dropdowns always match. */
export const fieldClass = (invalid?: boolean, className?: string) =>
  cn(
    'w-full rounded-md border bg-surface px-3 text-sm text-ink transition-colors placeholder:text-muted',
    'disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted',
    invalid ? 'border-danger' : 'border-field',
    className,
  );
