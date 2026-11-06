import type { ReactNode } from 'react';

interface AuthPageProps {
  title: string;
  description?: string;
  /** Links shown below the form, such as "Create an account". */
  footer?: ReactNode;
  children: ReactNode;
}

/** The centred layout shared by the login and register pages on every site. */
export function AuthPage({ title, description, footer, children }: AuthPageProps) {
  return (
    <main className="flex min-h-full items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <section className="rounded-md border border-line bg-surface p-6">
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <div className="mt-5">{children}</div>
        </section>
        {footer && <div className="mt-4 text-center text-sm text-muted">{footer}</div>}
      </div>
    </main>
  );
}
