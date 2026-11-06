import { CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MODULES } from '@/config/modules';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@kadai/ui';
import type { NavGroupEntry } from '@/types/navigation';
import { SidebarFlyout } from './SidebarFlyout';
import { SidebarIcon } from './SidebarIcon';
import { navItemClass } from './sidebarStyles';

export function SidebarGroup({ entry }: { entry: NavGroupEntry }) {
  const { isCollapsed } = useSidebar();
  const { pathname } = useLocation();
  const modules = entry.children.map((id) => MODULES[id]);
  const hasActiveChild = modules.some((module) => module.path === pathname);
  // Until someone toggles the group, it stays open while one of its pages is showing.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const isOpen = toggled ?? hasActiveChild;

  if (isCollapsed) {
    return <SidebarFlyout entry={entry} modules={modules} isActive={hasActiveChild} />;
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setToggled(!isOpen)}
        className={navItemClass({ isActive: hasActiveChild && !isOpen })}
      >
        <SidebarIcon icon={entry.icon} isActive={hasActiveChild} />
        <span className="truncate">{entry.label}</span>
        <CaretRightIcon
          size={14}
          aria-hidden
          weight="bold"
          className={cn('ml-auto shrink-0 text-muted transition-transform', isOpen && 'rotate-90')}
        />
      </button>
      {isOpen && (
        <ul className="mt-0.5 ml-[1.1rem] space-y-0.5 border-l border-line pl-2">
          {modules.map((module) => (
            <li key={module.id}>
              <NavLink to={module.path} end className={navItemClass}>
                <span className="truncate">{module.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
