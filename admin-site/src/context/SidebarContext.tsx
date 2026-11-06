import { type ReactNode, useMemo, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createStrictContext } from '@kadai/ui';

interface SidebarValue {
  /** Icon-only mode. Desktop only: the mobile drawer is always full width. */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const [Provider, useSidebar] = createStrictContext<SidebarValue>('Sidebar');

export { useSidebar };

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const [collapsed, setCollapsed] = usePersistentState('kadai.sidebarCollapsed', false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const value = useMemo(
    () => ({
      isCollapsed: collapsed && isDesktop,
      toggleCollapsed: () => setCollapsed(!collapsed),
      isMobileOpen,
      setMobileOpen,
    }),
    [collapsed, isDesktop, isMobileOpen, setCollapsed],
  );

  return <Provider value={value}>{children}</Provider>;
}
