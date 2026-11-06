import { NotificationsMenu } from './NotificationsMenu';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SearchTrigger } from './SearchTrigger';
import { SidebarToggle } from './SidebarToggle';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export function Navbar() {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 border-b border-line bg-surface px-2 sm:gap-2 sm:px-4">
      <SidebarToggle />
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
