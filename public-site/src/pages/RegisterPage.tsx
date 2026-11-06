import { AuthPage, useAuth } from '@kadai/ui';
import { Link, Navigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { usePageTitle } from '@/hooks/usePageTitle';

export function RegisterPage() {
  const { status } = useAuth();
  usePageTitle('Create account');

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Navigate to={PATHS.home} replace />;

  return (
    <AuthPage
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to={PATHS.login} className="rounded-md font-medium text-brand underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPage>
  );
}
