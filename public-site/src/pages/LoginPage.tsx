import { AuthPage, getReturnPath, LoginForm, useAuth, useAuthActions } from '@kadai/ui';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { PATHS } from '@/config/paths';
import { usePageTitle } from '@/hooks/usePageTitle';

export function LoginPage() {
  const { status } = useAuth();
  const { loginWithToast } = useAuthActions();
  const { state } = useLocation();
  usePageTitle('Log in');

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Navigate to={getReturnPath(state, PATHS.home)} replace />;

  return (
    <AuthPage
      title="Log in"
      footer={
        <>
          New here?{' '}
          <Link to={PATHS.register} className="rounded-md font-medium text-brand underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm onSubmit={loginWithToast} />
    </AuthPage>
  );
}
