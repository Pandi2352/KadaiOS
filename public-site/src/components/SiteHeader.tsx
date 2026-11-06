import { Button, buttonClass, getErrorMessage, useAuth, useToast } from '@kadai/ui';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';

export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATHS.home);
    } catch (error) {
      showToast(`Couldn't log out. ${getErrorMessage(error)}`, 'error');
    }
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
        <Link to={PATHS.home} className="rounded-md text-base font-semibold text-brand">
          KadaiOS
        </Link>
        {status === 'anonymous' && (
          <nav aria-label="Account" className="flex items-center gap-2">
            <Link to={PATHS.login} className={buttonClass('ghost')}>
              Log in
            </Link>
            <Link to={PATHS.register} className={buttonClass('primary')}>
              Create account
            </Link>
          </nav>
        )}
        {user && (
          <div className="flex min-w-0 items-center gap-3">
            <p className="truncate text-muted">{user.name}</p>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
