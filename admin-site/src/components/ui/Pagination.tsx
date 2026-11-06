import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button, cn } from '@kadai/ui';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  // Generate numbered pages with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 'ellipsis', totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-sm border-t border-line/60',
        className,
      )}
    >
      {/* Left side: Results Count & Page Size selector */}
      <div className="flex flex-wrap items-center gap-3 text-muted">
        <p aria-live="polite">
          Showing <span className="font-medium text-ink">{first}</span>–
          <span className="font-medium text-ink">{last}</span> of <span className="font-medium text-ink">{total}</span>{' '}
          items
        </p>

        {showPageSize && onLimitChange && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted">Per page:</span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onLimitChange(opt)}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                    limit === opt
                      ? 'bg-brand text-on-brand'
                      : 'bg-canvas hover:bg-hover text-muted hover:text-ink border border-line',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous Page"
            className="px-2 py-1.5 text-xs"
          >
            <CaretLeftIcon size={14} weight="bold" className="mr-1" />
            Prev
          </Button>

          <div className="flex items-center gap-1">
            {pages.map((p, index) => {
              if (p === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-muted select-none">
                    …
                  </span>
                );
              }

              const pageNum = p as number;
              const isCurrent = pageNum === page;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'min-w-8 h-8 flex items-center justify-center text-xs font-medium rounded-md transition-colors cursor-pointer',
                    isCurrent
                      ? 'bg-brand text-on-brand font-semibold'
                      : 'bg-surface hover:bg-hover text-ink border border-line',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next Page"
            className="px-2 py-1.5 text-xs"
          >
            Next
            <CaretRightIcon size={14} weight="bold" className="ml-1" />
          </Button>
        </div>
      )}
    </nav>
  );
}
