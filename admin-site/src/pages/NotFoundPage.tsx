import { Link } from 'react-router-dom';
import { buttonClass } from '@kadai/ui';
import { Notice } from '@/components/ui/Notice';
import { MODULES } from '@/config/modules';

export function NotFoundPage() {
  return (
    <Notice
      title="Page not found"
      action={
        <Link to={MODULES.dashboard.path} className={buttonClass('outline')}>
          Go to Dashboard
        </Link>
      }
    >
      This address doesn't match any page. Check the link, or use the sidebar to find what you need.
    </Notice>
  );
}
