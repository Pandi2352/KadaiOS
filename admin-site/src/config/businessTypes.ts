import { Beef, Flame, Milk, type LucideIcon } from 'lucide-react';
import type { BusinessType } from '@kadai/shared';

export interface BusinessTypeDefinition {
  id: BusinessType;
  label: string;
  /** Plural form, used in "This is for meat shops". */
  plural: string;
  icon: LucideIcon;
  units: string;
}

export const BUSINESS_TYPES: Record<BusinessType, BusinessTypeDefinition> = {
  meat: { id: 'meat', label: 'Meat shop', plural: 'meat shops', icon: Beef, units: 'Kg, grams' },
  crackers: { id: 'crackers', label: 'Crackers shop', plural: 'crackers shops', icon: Flame, units: 'Box, packet' },
  dairy: { id: 'dairy', label: 'Dairy shop', plural: 'dairy shops', icon: Milk, units: 'Litre, packet' },
};

export const DEFAULT_BUSINESS_TYPE: BusinessType = 'meat';
