import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import { useDismiss, cn } from '@kadai/ui';
import { SidebarBrand } from './SidebarBrand';
import { SidebarFooter } from './SidebarFooter';
import { SidebarNav } from './SidebarNav';
import { sidebarWidth } from './sidebarStyles';

export function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar();
  const { pathname } = useLocation();
  const asideRef = useRef<HTMLElement>(null);
  const refs = useMemo(() => [asideRef], []);

  useEffect(() => setMobileOpen(false), [pathname, setMobileOpen]);
  useDismiss(refs, () => setMobileOpen(false), isMobileOpen);

  return (
    <>
      {isMobileOpen && <div aria-hidden className="fixed inset-0 z-30 bg-scrim lg:hidden" />}
      <aside
        ref={asideRef}
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-line bg-surface transition-[translate,width]',
          'lg:visible lg:static lg:translate-x-0',
          isMobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
          isCollapsed ? sidebarWidth.collapsed : sidebarWidth.expanded,
        )}
      >
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>
    </>
  );
}
