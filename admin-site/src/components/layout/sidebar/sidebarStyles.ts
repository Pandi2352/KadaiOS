import { cn } from '@kadai/ui';

export const sidebarWidth = {
  expanded: 'w-64 lg:w-60',
  collapsed: 'lg:w-16',
};

const itemBase = 'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md text-sm transition-colors';

export const navItemClass = ({
  isActive = false,
  isCollapsed = false,
}: {
  isActive?: boolean;
  isCollapsed?: boolean;
}) =>
  cn(
    itemBase,
    isCollapsed ? 'justify-center px-0' : 'px-2.5',
    isActive ? 'bg-brand-soft font-medium text-brand-strong' : 'text-ink hover:bg-hover',
  );

export const sectionTitleClass = 'px-2.5 pb-1 text-xs font-medium text-muted';
