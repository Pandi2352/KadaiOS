import { MODULES } from '@/config/modules';
import { NAVIGATION } from '@/config/navigation';
import { QUICK_ACTIONS } from '@/config/quickActions';
import type {
  BusinessType,
  ModuleDefinition,
  ModuleId,
  NavEntry,
  NavSectionConfig,
  QuickAction,
} from '@/types/navigation';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

const isAllowed = (allowed: BusinessType[] | undefined, type: BusinessType) => !allowed || allowed.includes(type);

export const isModuleAvailable = (module: ModuleDefinition, type: BusinessType) =>
  isAllowed(module.businessTypes, type);

const resolveEntry = (entry: NavEntry, type: BusinessType): NavEntry | null => {
  if (entry.kind === 'link') {
    return isModuleAvailable(MODULES[entry.module], type) ? entry : null;
  }
  const children = entry.children.filter((id) => isModuleAvailable(MODULES[id], type));
  if (children.length === 0) return null;
  // A submenu with one item is just a link.
  if (children.length === 1) return { kind: 'link', module: children[0] };
  return { ...entry, children };
};

export function getVisibleNavigation(type: BusinessType): NavSectionConfig[] {
  return NAVIGATION.map((section) => ({
    ...section,
    entries: section.entries
      .map((entry) => resolveEntry(entry, type))
      .filter((entry): entry is NavEntry => entry !== null),
  })).filter((section) => section.entries.length > 0);
}

export const getVisibleModules = (type: BusinessType): ModuleDefinition[] =>
  Object.values(MODULES).filter((module) => isModuleAvailable(module, type));

export const getVisibleQuickActions = (type: BusinessType): QuickAction[] =>
  QUICK_ACTIONS.filter((action) => isAllowed(action.businessTypes, type));

const findGroupLabel = (id: ModuleId): string | undefined => {
  for (const section of NAVIGATION) {
    for (const entry of section.entries) {
      if (entry.kind === 'group' && entry.children.includes(id)) return entry.label;
    }
  }
  return undefined;
};

export const getPageTitle = (pathname: string): string =>
  Object.values(MODULES).find((module) => module.path === pathname)?.label ?? 'Page not found';

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const module = Object.values(MODULES).find((item) => item.path === pathname);
  if (!module) return [{ label: 'Page not found' }];

  const group = findGroupLabel(module.id);
  return [...(group ? [{ label: group }] : []), { label: module.label, path: module.path }];
}
