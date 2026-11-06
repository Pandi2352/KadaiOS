import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';

export function SiteLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
