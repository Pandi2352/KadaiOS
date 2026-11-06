import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import type { ModuleDefinition } from '@/types/navigation';
import { SidebarIcon } from './SidebarIcon';
import { navItemClass } from './sidebarStyles';

export function SidebarLink({ module }: { module: ModuleDefinition }) {
  const { isCollapsed } = useSidebar();

  return (
    <NavLink
      to={module.path}
      end
      title={isCollapsed ? module.label : undefined}
      aria-label={isCollapsed ? module.label : undefined}
      className={({ isActive }) => navItemClass({ isActive, isCollapsed })}
    >
      <SidebarIcon icon={module.icon} />
      {!isCollapsed && <span className="truncate">{module.label}</span>}
    </NavLink>
  );
}
