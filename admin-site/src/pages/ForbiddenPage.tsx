import { buttonClass, StatusPage } from '@kadai/ui';
import { Link } from 'react-router-dom';
import { MODULES } from '@/config/modules';

export function ForbiddenPage() {
  return (
    <StatusPage
      mark="!"
      title="You don't have access to this page"
      message="Your role doesn't include this page. If you need it for your work, ask a Super Admin to change your role."
      actions={
        <Link to={MODULES.dashboard.path} className={buttonClass('primary')}>
          Go to Dashboard
        </Link>
      }
    />
  );
}
