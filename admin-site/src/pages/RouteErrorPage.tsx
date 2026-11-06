import { useRouteError } from 'react-router-dom';
import { Button, buttonClass } from '@kadai/ui';
import { Notice } from '@/components/ui/Notice';
import { usePageTitle } from '@/hooks/usePageTitle';

/** Shown when a page crashes. It uses plain links and reloads because the app's state may be what broke. */
export function RouteErrorPage() {
  const error = useRouteError();
  usePageTitle('Something went wrong');

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <div className="p-4 lg:p-6">
      <Notice
        title="Something went wrong on this page"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <a href="/" className={buttonClass('outline')}>
              Go to Dashboard
            </a>
          </div>
        }
      >
        Reload to try again. If it keeps happening, go back to the Dashboard.
      </Notice>
    </div>
  );
}
