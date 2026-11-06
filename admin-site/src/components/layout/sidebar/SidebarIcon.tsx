import type { LucideIcon } from 'lucide-react';

export function SidebarIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={18} aria-hidden className="shrink-0" />;
}
