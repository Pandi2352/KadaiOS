import type { BusinessType } from './business-types.js';

export interface CreateShopInput {
  name: string;
  businessType: BusinessType;
  phone?: string;
  address?: string;
}

export interface Shop extends CreateShopInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}
