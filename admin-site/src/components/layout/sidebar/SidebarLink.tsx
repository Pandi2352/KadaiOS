import { Tooltip } from '@kadai/ui';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import type { ModuleDefinition } from '@/types/navigation';
import { SidebarIcon } from './SidebarIcon';
import { navItemClass } from './sidebarStyles';

export function SidebarLink({ module }: { module: ModuleDefinition }) {
  const { isCollapsed } = useSidebar();

  return (
    // With only icons showing, the tooltip is what names each link.
    <Tooltip label={module.label} side="right" disabled={!isCollapsed}>
      <NavLink
        to={module.path}
        end
        aria-label={isCollapsed ? module.label : undefined}
        className={({ isActive }) => navItemClass({ isActive, isCollapsed })}
      >
        {({ isActive }) => (
          <>
            <SidebarIcon icon={module.icon} isActive={isActive} />
            {!isCollapsed && <span className="truncate">{module.label}</span>}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}
