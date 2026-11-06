import type { IconComponent } from '@kadai/ui';
import { useMemo } from 'react';
import { MODULES } from '@/config/modules';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getVisibleModules, getVisibleQuickActions } from '@/lib/navigation';

export interface CommandItem {
  id: string;
  label: string;
  hint: 'Open' | 'Create';
  path: string;
  icon: IconComponent;
}

/** Everything the palette can jump to for this business type, filtered by the query. */
export function useCommandItems(query: string): CommandItem[] {
  const { businessType } = useWorkspace();

  return useMemo(() => {
    const items: CommandItem[] = [
      ...getVisibleModules(businessType).map((module) => ({
        id: `module-${module.id}`,
        label: module.label,
        hint: 'Open' as const,
        path: module.path,
        icon: module.icon,
      })),
      ...getVisibleQuickActions(businessType).map((action) => ({
        id: `action-${action.id}`,
        label: action.label,
        hint: 'Create' as const,
        path: MODULES[action.module].path,
        icon: action.icon,
      })),
    ];
    const needle = query.trim().toLowerCase();
    return needle ? items.filter((item) => item.label.toLowerCase().includes(needle)) : items;
  }, [businessType, query]);
}
