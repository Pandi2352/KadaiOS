import { IconButton } from '@kadai/ui';
import { TextIndentIcon, TextOutdentIcon } from '@phosphor-icons/react';
import { useSidebar } from '@/context/SidebarContext';

/** One spot, two jobs: it opens the drawer on phones and collapses the sidebar from the lg breakpoint. */
export function SidebarToggle() {
  const { isCollapsed, toggleCollapsed, setMobileOpen } = useSidebar();

  return (
    <>
      <IconButton icon={TextIndentIcon} label="Open menu" className="lg:hidden" onClick={() => setMobileOpen(true)} />
      <div className="hidden lg:block">
        <IconButton
          icon={isCollapsed ? TextIndentIcon : TextOutdentIcon}
          label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          onClick={toggleCollapsed}
        />
      </div>
    </>
  );
}
