import { Button, buttonClass, Tooltip, useAuth, useAuthActions } from '@kadai/ui';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';

export function SiteHeader() {
  const { status, user } = useAuth();
  const { logoutWithToast } = useAuthActions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (await logoutWithToast()) navigate(PATHS.home);
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
            <Tooltip label={user.email} side="bottom">
              <Link to={PATHS.profile} className="truncate rounded-md text-muted hover:text-ink hover:underline">
                {user.name}
              </Link>
            </Tooltip>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
