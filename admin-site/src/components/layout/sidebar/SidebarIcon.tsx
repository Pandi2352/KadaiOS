import type { Icon } from '@phosphor-icons/react';

interface SidebarIconProps {
  icon: Icon;
  /** The current page's icon turns solid, so it stands out from the duotone ones. */
  isActive?: boolean;
}

export function SidebarIcon({ icon: Icon, isActive = false }: SidebarIconProps) {
  return <Icon size={20} aria-hidden weight={isActive ? 'fill' : 'duotone'} className="shrink-0" />;
}
