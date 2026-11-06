import { MODULES } from '@/config/modules';
import { NAVIGATION } from '@/config/navigation';
import { QUICK_ACTIONS } from '@/config/quickActions';
import type { Can } from '@/hooks/useCan';
import type { BusinessType, ModuleDefinition, NavEntry, NavSectionConfig, QuickAction } from '@/types/navigation';

const isAllowed = (allowed: BusinessType[] | undefined, type: BusinessType) => !allowed || allowed.includes(type);

export const isModuleAvailable = (module: ModuleDefinition, type: BusinessType) =>
  isAllowed(module.businessTypes, type);

export const canOpenModule = (module: ModuleDefinition, can: Can) => !module.permission || can(module.permission);

const isModuleVisible = (module: ModuleDefinition, type: BusinessType, can: Can) =>
  isModuleAvailable(module, type) && canOpenModule(module, can);

const resolveEntry = (entry: NavEntry, type: BusinessType, can: Can): NavEntry | null => {
  if (entry.kind === 'link') {
    return isModuleVisible(MODULES[entry.module], type, can) ? entry : null;
  }
  const children = entry.children.filter((id) => isModuleVisible(MODULES[id], type, can));
  if (children.length === 0) return null;
  // A submenu with one item is just a link.
  if (children.length === 1) return { kind: 'link', module: children[0] };
  return { ...entry, children };
};

export function getVisibleNavigation(type: BusinessType, can: Can): NavSectionConfig[] {
  return NAVIGATION.map((section) => ({
    ...section,
    entries: section.entries
      .map((entry) => resolveEntry(entry, type, can))
      .filter((entry): entry is NavEntry => entry !== null),
  })).filter((section) => section.entries.length > 0);
}

export const getVisibleModules = (type: BusinessType, can: Can): ModuleDefinition[] =>
  Object.values(MODULES).filter((module) => isModuleVisible(module, type, can));

export const getVisibleQuickActions = (type: BusinessType, can: Can): QuickAction[] =>
  QUICK_ACTIONS.filter((action) => isAllowed(action.businessTypes, type) && can(action.permission));

export const getPageTitle = (pathname: string): string =>
  Object.values(MODULES).find((module) => module.path === pathname)?.label ?? 'Page not found';
