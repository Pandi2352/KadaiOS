import { useWorkspace } from '@/context/WorkspaceContext';
import { getVisibleNavigation } from '@/lib/navigation';
import { SidebarSection } from './SidebarSection';

export function SidebarNav() {
  const { businessType } = useWorkspace();

  return (
    <nav aria-label="Modules" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2">
      {getVisibleNavigation(businessType).map((section) => (
        <SidebarSection key={section.title} section={section} />
      ))}
    </nav>
  );
}
