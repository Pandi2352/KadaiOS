import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { SidebarIcon } from './SidebarIcon';
import { navItemClass } from './sidebarStyles';

/** Collapsing only applies on desktop, so this is hidden in the mobile drawer. */
export function SidebarFooter() {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <div className="hidden shrink-0 border-t border-line p-2 lg:block">
      <button
        type="button"
        title={label}
        aria-label={label}
        onClick={toggleCollapsed}
        className={navItemClass({ isCollapsed })}
      >
        <SidebarIcon icon={isCollapsed ? PanelLeftOpen : PanelLeftClose} />
        {!isCollapsed && <span>Collapse</span>}
      </button>
    </div>
  );
}
