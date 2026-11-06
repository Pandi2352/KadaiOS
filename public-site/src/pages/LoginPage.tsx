import { AuthPage, LoginForm, useAuth } from '@kadai/ui';
import { Link, Navigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';
import { usePageTitle } from '@/hooks/usePageTitle';

export function LoginPage() {
  const { status, login } = useAuth();
  usePageTitle('Log in');

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Navigate to={PATHS.home} replace />;

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
      <LoginForm onSubmit={login} />
    </AuthPage>
  );
}
