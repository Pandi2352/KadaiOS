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
  { id: 'new-sale', label: 'New sale', module: 'billing', icon: CashRegisterIcon },
  { id: 'add-product', label: 'Add product', module: 'products', icon: PackageIcon },
  { id: 'record-purchase', label: 'Record purchase', module: 'purchases', icon: ShoppingCartIcon },
  { id: 'add-expense', label: 'Add expense', module: 'expenses', icon: WalletIcon },
  { id: 'add-customer', label: 'Add customer', module: 'customers', icon: UserPlusIcon },
  { id: 'record-wastage', label: 'Record wastage', module: 'wastage', icon: KnifeIcon, businessTypes: ['meat'] },
  {
    id: 'new-quotation',
    label: 'New quotation',
    module: 'quotations',
    icon: FilePlusIcon,
    businessTypes: ['crackers'],
  },
  {
    id: 'new-plan',
    label: 'New delivery plan',
    module: 'subscriptions',
    icon: CalendarPlusIcon,
    businessTypes: ['dairy'],
  },
];
