import { AuthPage, getReturnPath, Loader, LoginForm, useAuth } from '@kadai/ui';
import { Navigate, useLocation } from 'react-router-dom';
import { MODULES } from '@/config/modules';
import { SITE } from '@/config/site';
import { usePageTitle } from '@/hooks/usePageTitle';

/** There's no sign-up link here: admins join by invitation. */
export function LoginPage() {
  const { status, login } = useAuth();
  const { state } = useLocation();
  usePageTitle('Log in');

  if (status === 'loading') return <Loader label="Checking your session" />;
  if (status === 'authenticated') return <Navigate to={getReturnPath(state, MODULES.dashboard.path)} replace />;

  return (
    <AuthPage title={`Log in to ${SITE.name}`} description="For shop owners and staff.">
      <LoginForm onSubmit={login} />
    </AuthPage>
  );
}
