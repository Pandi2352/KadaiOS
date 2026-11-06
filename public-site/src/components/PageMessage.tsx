import { usePageTitle } from '@/hooks/usePageTitle';

interface PageMessageProps {
  title: string;
  message: string;
}

/** Shared layout for the not-found and error pages. A plain link recovers even if the app's state broke. */
export function PageMessage({ title, message }: PageMessageProps) {
  usePageTitle(title);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      <a href="/" className="mt-4 inline-block rounded-md font-medium text-brand underline">
        Go to the home page
      </a>
    </main>
  );
}
