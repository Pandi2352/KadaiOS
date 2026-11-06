import type { Shop } from '@kadai/shared';
import { PlusIcon, StorefrontIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button, QueryState, useApiQuery, useToast } from '@kadai/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { CreateShopModal } from '@/features/shops/CreateShopModal';
import { shopsApi } from '@/features/shops/shopsApi';
import { ShopsTable } from '@/features/shops/ShopsTable';

const DEFAULT_PAGE_SIZE = 10;

export function BusinessSetupPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [isCreating, setCreating] = useState(false);
  const query = useApiQuery((signal) => shopsApi.list({ page, limit }, signal), `shops-${page}-${limit}`);

  const handleCreated = (shop: Shop) => {
    showToast(`${shop.name} added`, { title: 'Shop added' });
    if (page === 1) query.refetch();
    else setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const addButton = (
    <Button variant="primary" icon={PlusIcon} onClick={() => setCreating(true)}>
      Add shop
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Business Setup"
        description="Register and manage business outlets, trade categories, and operating units."
        actions={addButton}
      />
      <QueryState
        query={query}
        loadingLabel="Loading shops"
        errorTitle="Couldn't load shops"
        isEmpty={(data) => data.total === 0}
        empty={
          <EmptyState
            icon={StorefrontIcon}
            title="No shops yet"
            description="Add your first shop to choose its business type and start operations."
            action={addButton}
          />
        }
      >
        {(data) => (
          <ShopsTable
            shops={data.items}
            isRefreshing={query.isLoading}
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
          />
        )}
      </QueryState>
      <CreateShopModal isOpen={isCreating} onClose={() => setCreating(false)} onCreated={handleCreated} />
    </div>
  );
}
