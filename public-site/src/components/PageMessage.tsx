import { buttonClass, StatusPage } from '@kadai/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

interface PageMessageProps {
  mark: '!' | '?';
  title: string;
  message: string;
}

/** The not-found and error pages. A plain link recovers even if the app's state broke. */
export function PageMessage({ mark, title, message }: PageMessageProps) {
  usePageTitle(title);

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <StatusPage
        mark={mark}
        title={title}
        message={message}
        actions={
          <a href="/" className={buttonClass('primary')}>
            Go to the home page
          </a>
        }
      />
    </main>
  );
}
