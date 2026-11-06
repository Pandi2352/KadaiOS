import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'text' | 'icon' | 'responsive';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong',
  outline: 'border border-line bg-surface text-ink hover:bg-hover',
  ghost: 'text-ink hover:bg-hover',
  danger: 'bg-danger text-on-brand hover:bg-danger-strong',
};

// Padding lives only here: Tailwind picks clashing utilities by CSS order, not by class order.
const SIZES: Record<ButtonSize, string> = {
  text: 'px-3',
  icon: 'w-9 shrink-0',
  /** Icon-only on phones, icon and text from the sm breakpoint. */
  responsive: 'w-9 shrink-0 sm:w-auto sm:px-3',
};

export const buttonClass = (variant: ButtonVariant = 'outline', size: ButtonSize = 'text', className?: string) =>
  cn(
    'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors [&>svg]:shrink-0',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export const iconButtonClass = (variant: ButtonVariant = 'ghost', className?: string) =>
  buttonClass(variant, 'icon', className);
