import { buttonClass, StatusPage } from '@kadai/ui';
import { Link } from 'react-router-dom';
import { MODULES } from '@/config/modules';

export function NotFoundPage() {
  return (
    <StatusPage
      mark="?"
      title="Page not found"
      message="This address doesn't match any page. Check the link, or use the sidebar to find what you need."
      actions={
        <Link to={MODULES.dashboard.path} className={buttonClass('primary')}>
          Go to Dashboard
        </Link>
      }
    />
  );
}
