import type { ReactNode } from 'react';

interface NoticeProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Notice({ title, children, action }: NoticeProps) {
  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <h2 className="font-medium">{title}</h2>
      <div className="mt-1 max-w-prose text-muted">{children}</div>
      {action && <div className="mt-3">{action}</div>}
    </section>
  );
}
