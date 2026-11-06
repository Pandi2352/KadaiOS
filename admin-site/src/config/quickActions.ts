import {
  CalendarPlusIcon,
  CashRegisterIcon,
  FilePlusIcon,
  KnifeIcon,
  PackageIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import type { QuickAction } from '@/types/navigation';

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-sale', label: 'New sale', module: 'billing', icon: CashRegisterIcon, permission: 'orders:create' },
  { id: 'add-product', label: 'Add product', module: 'products', icon: PackageIcon, permission: 'inventory:manage' },
  {
    id: 'record-purchase',
    label: 'Record purchase',
    module: 'purchases',
    icon: ShoppingCartIcon,
    permission: 'inventory:manage',
  },
  { id: 'add-expense', label: 'Add expense', module: 'expenses', icon: WalletIcon, permission: 'settings:manage' },
  { id: 'add-customer', label: 'Add customer', module: 'customers', icon: UserPlusIcon, permission: 'orders:create' },
  {
    id: 'record-wastage',
    label: 'Record wastage',
    module: 'wastage',
    icon: KnifeIcon,
    permission: 'inventory:manage',
    businessTypes: ['meat'],
  },
  {
    id: 'new-quotation',
    label: 'New quotation',
    module: 'quotations',
    icon: FilePlusIcon,
    permission: 'orders:create',
    businessTypes: ['crackers'],
  },
  {
    id: 'new-plan',
    label: 'New delivery plan',
    module: 'subscriptions',
    icon: CalendarPlusIcon,
    permission: 'orders:manage',
    businessTypes: ['dairy'],
  },
];
