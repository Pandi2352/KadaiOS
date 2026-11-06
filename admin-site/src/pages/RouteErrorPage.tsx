import { Button, buttonClass, StatusPage } from '@kadai/ui';
import { useRouteError } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';

const readError = (error: unknown) => (error instanceof Error ? (error.stack ?? error.message) : String(error));

/** Shown when a page crashes. It uses plain links and reloads because the app's state may be what broke. */
export function RouteErrorPage() {
  const error = useRouteError();
  usePageTitle('Something went wrong');

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <StatusPage
      mark="!"
      title="Something went wrong on this page"
      message="Reload to try again. If it keeps happening, go back to the Dashboard."
      actions={
        <>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <a href="/" className={buttonClass('outline')}>
            Go to Dashboard
          </a>
        </>
      }
    >
      {import.meta.env.DEV && (
        <details className="mt-6 w-full max-w-2xl rounded-md border border-line bg-surface p-3 text-left">
          <summary className="cursor-pointer font-medium">Error details (development only)</summary>
          <pre className="mt-2 max-h-48 overflow-auto text-xs whitespace-pre-wrap text-muted">{readError(error)}</pre>
        </details>
      )}
    </StatusPage>
  );
}
