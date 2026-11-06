import type { BusinessType } from '@kadai/shared';
import type { IconComponent } from '@kadai/ui';
import { CowIcon, FireIcon, JarLabelIcon } from '@phosphor-icons/react';

export interface BusinessTypeDefinition {
  id: BusinessType;
  label: string;
  /** Plural form, used in "This is for meat shops". */
  plural: string;
  icon: IconComponent;
  units: string;
}

export const BUSINESS_TYPES: Record<BusinessType, BusinessTypeDefinition> = {
  meat: { id: 'meat', label: 'Meat shop', plural: 'meat shops', icon: CowIcon, units: 'Kg, grams' },
  crackers: { id: 'crackers', label: 'Crackers shop', plural: 'crackers shops', icon: FireIcon, units: 'Box, packet' },
  dairy: { id: 'dairy', label: 'Dairy shop', plural: 'dairy shops', icon: JarLabelIcon, units: 'Litre, packet' },
};

export const DEFAULT_BUSINESS_TYPE: BusinessType = 'meat';
