import { CheckCircleIcon, TrendDownIcon, TrendUpIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@kadai/ui';

interface TrendBadgeProps {
  value: number;
  formatted?: string;
  showIcon?: boolean;
  className?: string;
}

export function TrendBadge({ value, formatted, showIcon = true, className }: TrendBadgeProps) {
  if (value === 0 || Number.isNaN(value)) {
    return <span className={cn('text-muted font-mono text-xs', className)}>—</span>;
  }

  const isPositive = value > 0;
  const displayText = formatted ?? `${isPositive ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono text-xs font-semibold',
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
        className,
      )}
    >
      {showIcon && (isPositive ? <TrendUpIcon size={12} weight="bold" /> : <TrendDownIcon size={12} weight="bold" />)}
      {displayText}
    </span>
  );
}

interface EntityCellProps {
  title: string;
  subtitle?: string;
  avatar?: ReactNode;
  icon?: ReactNode;
  verified?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function EntityCell({ title, subtitle, avatar, icon, verified = false, badge, className }: EntityCellProps) {
  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      {avatar && <div className="shrink-0 overflow-hidden rounded-md">{avatar}</div>}
      {!avatar && icon && (
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-brand-soft text-brand">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-ink truncate text-sm">{title}</span>
          {verified && (
            <CheckCircleIcon size={15} weight="fill" className="text-brand shrink-0" aria-label="Verified" />
          )}
          {badge}
        </div>
        {subtitle && <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

interface MetricCellProps {
  primary: ReactNode;
  secondary?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function MetricCell({ primary, secondary, align = 'right', className }: MetricCellProps) {
  return (
    <div className={cn('flex flex-col', align === 'right' ? 'items-end' : 'items-start', className)}>
      <span className="font-mono text-sm font-medium text-ink">{primary}</span>
      {secondary && <span className="font-mono text-xs text-muted mt-0.5">{secondary}</span>}
    </div>
  );
}
