import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IconButton } from '@/components/ui/IconButton';
import { MODULES } from '@/config/modules';
import { SITE } from '@/config/site';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/cn';

export function SidebarBrand() {
  const { isCollapsed, setMobileOpen } = useSidebar();

  return (
    <div className={cn('flex h-14 shrink-0 items-center border-b border-line', isCollapsed ? 'justify-center' : 'justify-between px-3')}>
      <Link to={MODULES.dashboard.path} aria-label={`${SITE.name} home`} className="flex items-center gap-2 rounded-md">
        <span aria-hidden className="flex size-8 items-center justify-center rounded-md bg-brand font-semibold text-on-brand">
          {SITE.mark}
        </span>
        {!isCollapsed && <span className="text-base font-semibold">{SITE.name}</span>}
      </Link>
      <IconButton icon={X} label="Close menu" className="lg:hidden" onClick={() => setMobileOpen(false)} />
    </div>
  );
}
