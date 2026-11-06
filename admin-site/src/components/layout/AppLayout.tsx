import { Outlet, useLocation } from 'react-router-dom';
import { CommandPaletteProvider } from '@/context/CommandPaletteContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getPageTitle } from '@/lib/navigation';
import { CommandPalette } from './command-palette/CommandPalette';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';

export function AppLayout() {
  const { pathname } = useLocation();
  usePageTitle(getPageTitle(pathname));

  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <a
          href="#main"
          className="sr-only rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60"
        >
          Skip to content
        </a>
        <div className="flex h-dvh overflow-hidden bg-canvas">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar />
            <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
        <CommandPalette />
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}
