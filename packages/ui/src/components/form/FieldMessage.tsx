import { WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '../../cn';

type MessageTone = 'hint' | 'error' | 'warning';

const TONES = {
  hint: { className: 'text-muted', icon: null },
  error: { className: 'text-danger', icon: WarningCircleIcon },
  warning: { className: 'text-warning', icon: WarningIcon },
};

interface FieldMessageProps {
  id?: string;
  tone?: MessageTone;
  className?: string;
  children: ReactNode;
}

/** The line under a field. Errors and warnings are read out by screen readers when they appear. */
export function FieldMessage({ id, tone = 'hint', className, children }: FieldMessageProps) {
  const { className: toneClass, icon: Icon } = TONES[tone];

  return (
    <p
      id={id}
      aria-live={tone === 'hint' ? undefined : 'polite'}
      className={cn('flex min-w-0 items-start gap-1', toneClass, className)}
    >
      {Icon && <Icon size={16} weight="bold" aria-hidden className="mt-0.5 shrink-0" />}
      {children}
    </p>
  );
}
