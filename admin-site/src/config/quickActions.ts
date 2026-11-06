import { CalendarPlus, ClipboardPlus, FilePlus, PackagePlus, ReceiptText, Trash2, UserPlus, Wallet } from 'lucide-react';
import type { QuickAction } from '@/types/navigation';

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-sale', label: 'New sale', module: 'billing', icon: ReceiptText },
  { id: 'add-product', label: 'Add product', module: 'products', icon: PackagePlus },
  { id: 'record-purchase', label: 'Record purchase', module: 'purchases', icon: ClipboardPlus },
  { id: 'add-expense', label: 'Add expense', module: 'expenses', icon: Wallet },
  { id: 'add-customer', label: 'Add customer', module: 'customers', icon: UserPlus },
  { id: 'record-wastage', label: 'Record wastage', module: 'wastage', icon: Trash2, businessTypes: ['meat'] },
  { id: 'new-quotation', label: 'New quotation', module: 'quotations', icon: FilePlus, businessTypes: ['crackers'] },
  { id: 'new-plan', label: 'New delivery plan', module: 'subscriptions', icon: CalendarPlus, businessTypes: ['dairy'] },
];
