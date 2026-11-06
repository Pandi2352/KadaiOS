import { Boxes, Repeat, ShoppingBag } from 'lucide-react';
import type { NavSectionConfig } from '@/types/navigation';

export const NAVIGATION: NavSectionConfig[] = [
  {
    title: 'Home',
    entries: [{ kind: 'link', module: 'dashboard' }],
  },
  {
    title: 'Sales',
    entries: [
      { kind: 'link', module: 'billing' },
      { kind: 'group', id: 'orders', label: 'Orders', icon: ShoppingBag, children: ['orders', 'quotations'] },
      {
        kind: 'group',
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: Repeat,
        children: ['subscriptions', 'deliveries'],
      },
      { kind: 'link', module: 'customers' },
    ],
  },
  {
    title: 'Stock',
    entries: [
      { kind: 'link', module: 'products' },
      {
        kind: 'group',
        id: 'inventory',
        label: 'Inventory',
        icon: Boxes,
        children: ['stock', 'wastage', 'seasonal', 'expiry'],
      },
      { kind: 'link', module: 'purchases' },
      { kind: 'link', module: 'suppliers' },
    ],
  },
  {
    title: 'Money',
    entries: [
      { kind: 'link', module: 'expenses' },
      { kind: 'link', module: 'reports' },
    ],
  },
  {
    title: 'Manage',
    entries: [
      { kind: 'link', module: 'staff' },
      { kind: 'link', module: 'setup' },
    ],
  },
];
