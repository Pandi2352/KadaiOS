import type { BusinessType, Permission } from '@kadai/shared';
import type { Icon } from '@phosphor-icons/react';

export type { BusinessType };

export type ModuleId =
  | 'dashboard'
  | 'billing'
  | 'orders'
  | 'quotations'
  | 'customers'
  | 'subscriptions'
  | 'deliveries'
  | 'products'
  | 'stock'
  | 'wastage'
  | 'seasonal'
  | 'expiry'
  | 'purchases'
  | 'suppliers'
  | 'expenses'
  | 'reports'
  | 'staff'
  | 'setup'
  | 'profile';

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  path: string;
  icon: Icon;
  description: string;
  /** Where this module sits in docs/PHASE_PLAN.md, such as "Phase 5" or "Step 25". */
  planned: string;
  /** Needed to see and open this module. Leave unset when every role gets it. */
  permission?: Permission;
  /** Leave unset when every business type gets this module. */
  businessTypes?: BusinessType[];
  /** How the module behaves for a specific business type. */
  byBusiness?: Partial<Record<BusinessType, string>>;
}

export interface NavLinkEntry {
  kind: 'link';
  module: ModuleId;
}

export interface NavGroupEntry {
  kind: 'group';
  id: string;
  label: string;
  icon: Icon;
  children: ModuleId[];
}

export type NavEntry = NavLinkEntry | NavGroupEntry;

export interface NavSectionConfig {
  title: string;
  entries: NavEntry[];
}

export interface QuickAction {
  id: string;
  label: string;
  module: ModuleId;
  icon: Icon;
  permission: Permission;
  businessTypes?: BusinessType[];
}
