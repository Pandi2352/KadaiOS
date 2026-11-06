import type { ReactNode } from 'react';

interface ProfileSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <section className="rounded-md border border-line bg-surface">
      <header className="border-b border-line p-4">
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-muted">{description}</p>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
