import { cn } from '../../cn';

/**
 * Shared look for every text-like control, so inputs and dropdowns always match. A focused field
 * shows one border in the brand colour, so the global focus outline is turned off here.
 */
export const fieldClass = (invalid?: boolean, className?: string) =>
  cn(
    'w-full rounded-md border bg-surface px-3 text-sm text-ink transition-colors outline-none placeholder:text-muted',
    'disabled:cursor-not-allowed disabled:border-line disabled:bg-hover disabled:text-muted',
    'has-disabled:cursor-not-allowed has-disabled:border-line has-disabled:bg-hover has-disabled:text-muted',
    invalid ? 'border-danger' : 'border-field focus:border-brand focus-within:border-brand aria-expanded:border-brand',
    className,
  );
