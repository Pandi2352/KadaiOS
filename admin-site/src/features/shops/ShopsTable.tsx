import { formatShopDate, type Shop } from '@kadai/shared';
import { StorefrontIcon } from '@phosphor-icons/react';
import { type TableColumn } from '@/components/ui/Table';
import { DataTable } from '@/components/ui/DataTable';
import { EntityCell } from '@/components/ui/DataTable/cells';
import { BUSINESS_TYPES } from '@/config/businessTypes';

interface ShopsTableProps {
  shops: Shop[];
  isRefreshing: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function ShopsTable({ shops, isRefreshing, total, page, limit, onPageChange, onLimitChange }: ShopsTableProps) {
  const columns: TableColumn<Shop>[] = [
    {
      key: 'name',
      header: 'Shop',
      sortable: true,
      render: (shop) => {
        const typeDef = BUSINESS_TYPES[shop.businessType];
        const Icon = typeDef?.icon ?? StorefrontIcon;

        return (
          <EntityCell
            title={shop.name}
            subtitle={shop.address || 'Address not specified'}
            icon={<Icon size={18} weight="duotone" />}
            verified
          />
        );
      },
    },
    {
      key: 'businessType',
      header: 'Business Type',
      sortable: true,
      render: (shop) => {
        const typeDef = BUSINESS_TYPES[shop.businessType];
        const Icon = typeDef?.icon ?? StorefrontIcon;

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-canvas border border-line">
            <Icon size={14} className="text-brand shrink-0" />
            <span>{typeDef?.label ?? shop.businessType}</span>
          </span>
        );
      },
    },
    {
      key: 'units',
      header: 'Billing Units',
      render: (shop) => {
        const typeDef = BUSINESS_TYPES[shop.businessType];
        return <span className="font-mono text-xs text-muted">{typeDef?.units ?? '—'}</span>;
      },
    },
    {
      key: 'phone',
      header: 'Phone Contact',
      render: (shop) =>
        shop.phone ? (
          <span className="font-mono text-xs font-medium text-ink">{shop.phone}</span>
        ) : (
          <span className="text-muted text-xs">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: () => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered On',
      align: 'right',
      sortable: true,
      render: (shop) => (
        <span className="font-mono text-xs text-muted">{formatShopDate(new Date(shop.createdAt))}</span>
      ),
    },
  ];

  // Grid card representation for the view switcher
  const renderGridCard = (shop: Shop, index: number) => {
    const typeDef = BUSINESS_TYPES[shop.businessType];
    const Icon = typeDef?.icon ?? StorefrontIcon;

    return (
      <div className="rounded-md border border-line bg-surface p-4 hover:border-brand/40 transition-colors flex flex-col justify-between h-full space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Icon size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-ink text-sm">{shop.name}</span>
                <span className="text-xs font-mono text-muted/60">#{index + 1}</span>
              </div>
              <p className="text-xs text-muted truncate max-w-[200px] mt-0.5">{shop.address || 'No address'}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 shrink-0">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60 text-xs">
          <div>
            <span className="text-muted block text-[11px]">Type</span>
            <span className="font-medium text-ink">{typeDef?.label}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Units</span>
            <span className="font-mono text-ink">{typeDef?.units}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Phone</span>
            <span className="font-mono text-ink">{shop.phone || '—'}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Created</span>
            <span className="font-mono text-muted">{formatShopDate(new Date(shop.createdAt))}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DataTable<Shop>
      caption="Shops"
      columns={columns}
      data={shops}
      rowKey={(shop) => shop.id}
      isRefreshing={isRefreshing}
      showRank
      starable
      searchable
      searchFilter={(shop, query) =>
        shop.name.toLowerCase().includes(query) ||
        (shop.address && shop.address.toLowerCase().includes(query)) ||
        (shop.phone && shop.phone.includes(query)) ||
        BUSINESS_TYPES[shop.businessType]?.label.toLowerCase().includes(query)
      }
      renderGridCard={renderGridCard}
      pagination={
        onPageChange
          ? {
              page: page ?? 1,
              limit: limit ?? 20,
              total: total ?? shops.length,
              onPageChange,
              onLimitChange,
            }
          : undefined
      }
      exportFilename="shops-directory"
    />
  );
}
