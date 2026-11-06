import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useAuth } from './AuthProvider';
import type { RedirectState } from './returnPath';

interface RequireAuthProps {
  loginPath: string;
  children: ReactNode;
}

/**
 * Protects pages. While the session is restoring it shows a loader, so a logged-in person
 * never sees the login page flash on reload, and the protected page never flashes for anyone else.
 */
export function RequireAuth({ loginPath, children }: RequireAuthProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader label="Checking your session" />
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to={loginPath} replace state={{ from: location } satisfies RedirectState} />;
  }
  return children;
}
