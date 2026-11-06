import type { Shop } from '@kadai/shared';
import { PlusIcon, StorefrontIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button, useToast } from '@kadai/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { QueryState } from '@/components/ui/QueryState';
import { CreateShopModal } from '@/features/shops/CreateShopModal';
import { shopsApi } from '@/features/shops/shopsApi';
import { ShopsTable } from '@/features/shops/ShopsTable';
import { useApiQuery } from '@/hooks/useApiQuery';

const PAGE_SIZE = 20;

export function BusinessSetupPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [isCreating, setCreating] = useState(false);
  const query = useApiQuery((signal) => shopsApi.list({ page, limit: PAGE_SIZE }, signal), `shops-${page}`);

  const handleCreated = (shop: Shop) => {
    showToast(`${shop.name} added`);
    // Newest shops come first, so page 1 shows the new one.
    if (page === 1) query.refetch();
    else setPage(1);
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
        description="Register shops and choose each shop's business type. Until pages are protected later in Phase 2, everyone using this app sees every shop."
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
            description="Add your first shop to choose its business type."
            action={addButton}
          />
        }
      >
        {(data) => (
          <div className="space-y-3">
            <ShopsTable shops={data.items} isRefreshing={query.isLoading} />
            <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
          </div>
        )}
      </QueryState>
      <CreateShopModal isOpen={isCreating} onClose={() => setCreating(false)} onCreated={handleCreated} />
    </div>
  );
}
