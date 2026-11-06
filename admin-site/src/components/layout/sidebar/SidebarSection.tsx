import { MODULES } from '@/config/modules';
import { useSidebar } from '@/context/SidebarContext';
import type { NavSectionConfig } from '@/types/navigation';
import { SidebarGroup } from './SidebarGroup';
import { SidebarLink } from './SidebarLink';
import { sectionTitleClass } from './sidebarStyles';

export function SidebarSection({ section }: { section: NavSectionConfig }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={isCollapsed ? 'not-first:border-t not-first:border-line not-first:pt-2' : undefined}>
      {!isCollapsed && <h2 className={sectionTitleClass}>{section.title}</h2>}
      <ul className="space-y-0.5">
        {section.entries.map((entry) => (
          <li key={entry.kind === 'link' ? entry.module : entry.id}>
            {entry.kind === 'link' ? <SidebarLink module={MODULES[entry.module]} /> : <SidebarGroup entry={entry} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
