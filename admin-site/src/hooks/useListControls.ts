import { useCallback, useState } from 'react';
import { usePagination } from './usePagination';

/** A list's filters and page together, because changing a filter has to go back to the first page. */
export function useListControls<F>(noFilters: F) {
  const { page, limit, setPage, setLimit } = usePagination();
  const [filters, setFiltersState] = useState(noFilters);

  const setFilters = useCallback(
    (next: F) => {
      setFiltersState(next);
      setPage(1);
    },
    [setPage],
  );

  return { filters, setFilters, page, limit, setPage, setLimit };
}

export type ListControls<F> = ReturnType<typeof useListControls<F>>;
