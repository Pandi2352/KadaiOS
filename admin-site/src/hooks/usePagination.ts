import type { Paginated } from '@kadai/shared';
import { useCallback, useEffect, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination(defaultLimit = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(defaultLimit);

  const setLimit = useCallback((next: number) => {
    setLimitState(next);
    setPage(1);
  }, []);

  return { page, limit, setPage, setLimit };
}

/** Deleting the only row on the last page would otherwise leave an empty page. */
export function useKeepPageInRange(data: Paginated<unknown> | undefined, setPage: (page: number) => void) {
  const lastPage = data && data.total > 0 ? Math.ceil(data.total / data.limit) : 1;
  const isPastEnd = data !== undefined && data.page > lastPage;

  useEffect(() => {
    if (isPastEnd) setPage(lastPage);
  }, [isPastEnd, lastPage, setPage]);
}
