import type { IconComponent } from '@kadai/ui';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: IconComponent;
  title: string;
  /** Say why it's empty and what to do first. */
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center rounded-md border border-line bg-surface px-4 py-10 text-center">
      {Icon && <Icon size={24} aria-hidden className="text-muted" />}
      <h2 className="mt-2 font-medium">{title}</h2>
      <p className="mt-1 max-w-prose text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
