import { useWorkspace } from '@/context/WorkspaceContext';
import { useCan } from '@/hooks/useCan';
import { getVisibleNavigation } from '@/lib/navigation';
import { SidebarSection } from './SidebarSection';

export function SidebarNav() {
  const { businessType } = useWorkspace();
  const can = useCan();

  return (
    // From lg up the 6px scrollbar space is always kept, so the right padding is reduced to stay even with the left.
    <nav aria-label="Modules" className="scrollbar-reveal min-h-0 flex-1 space-y-4 overflow-y-auto p-2 lg:pr-0.5">
      {getVisibleNavigation(businessType, can).map((section) => (
        <SidebarSection key={section.title} section={section} />
      ))}
    </nav>
  );
}
