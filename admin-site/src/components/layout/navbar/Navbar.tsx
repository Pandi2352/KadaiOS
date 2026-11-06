import { Menu } from 'lucide-react';
import { IconButton } from '@kadai/ui';
import { useSidebar } from '@/context/SidebarContext';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationsMenu } from './NotificationsMenu';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SearchTrigger } from './SearchTrigger';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export function Navbar() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 border-b border-line bg-surface px-2 sm:gap-2 sm:px-4">
      <IconButton icon={Menu} label="Open menu" className="lg:hidden" onClick={() => setMobileOpen(true)} />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <SearchTrigger />
        <QuickCreateMenu />
        <NotificationsMenu />
        <WorkspaceSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
