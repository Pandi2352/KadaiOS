import { formatShopDate, type Shop } from '@kadai/shared';
import { Table, type TableColumn } from '@/components/ui/Table';
import { BUSINESS_TYPES } from '@/config/businessTypes';

const COLUMNS: TableColumn<Shop>[] = [
  { key: 'name', header: 'Shop', render: (shop) => <span className="font-medium">{shop.name}</span> },
  { key: 'businessType', header: 'Business type', render: (shop) => BUSINESS_TYPES[shop.businessType].label },
  { key: 'phone', header: 'Phone', render: (shop) => shop.phone },
  { key: 'address', header: 'Address', render: (shop) => shop.address },
  { key: 'createdAt', header: 'Added', render: (shop) => formatShopDate(new Date(shop.createdAt)) },
];

export function ShopsTable({ shops, isRefreshing }: { shops: Shop[]; isRefreshing: boolean }) {
  return (
    <Table caption="Shops" columns={COLUMNS} rows={shops} rowKey={(shop) => shop.id} isRefreshing={isRefreshing} />
  );
}
