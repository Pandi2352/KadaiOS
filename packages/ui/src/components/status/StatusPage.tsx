import type { ReactNode } from 'react';
import { ShopIllustration } from './ShopIllustration';

interface StatusPageProps {
  mark: '!' | '?';
  title: string;
  message: string;
  /** Buttons or links that get the person moving again. */
  actions: ReactNode;
  /** Extra detail below the actions, such as error information in development. */
  children?: ReactNode;
}

/** The centred page for errors and missing pages, shared by every site. */
export function StatusPage({ mark, title, message, actions, children }: StatusPageProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center p-4 text-center">
      <ShopIllustration mark={mark} className="w-full max-w-72" />
      <h1 className="mt-4 text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>
      {children}
    </div>
  );
}
