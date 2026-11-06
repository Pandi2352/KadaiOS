import { Button } from './Button';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-muted" aria-live="polite">
        {first}–{last} of {total}
      </p>
      {total > limit && (
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button disabled={last >= total} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </nav>
  );
}
