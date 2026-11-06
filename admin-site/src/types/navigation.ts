import type { LucideIcon } from 'lucide-react';

export type BusinessType = 'meat' | 'crackers' | 'dairy';

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
  | 'setup';

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
  phase: number;
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
  icon: LucideIcon;
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
  icon: LucideIcon;
  businessTypes?: BusinessType[];
}
