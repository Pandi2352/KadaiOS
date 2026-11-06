import { cn, IconButton, Select, type SelectOption } from '@kadai/ui';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { ELLIPSIS, getPageNumbers } from './pageNumbers';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const sizes: SelectOption<string>[] = pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }));

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pt-1 text-sm', className)}
    >
      <div className="flex items-center gap-4 text-muted">
        <p aria-live="polite" className="tabular-nums whitespace-nowrap">
          {first}–{last} of {total}
        </p>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="hidden whitespace-nowrap sm:inline">Rows per page</span>
            <div className="w-20 text-ink">
              <Select
                aria-label="Rows per page"
                options={sizes}
                value={String(limit)}
                onChange={(size) => {
                  if (size) onLimitChange(Number(size));
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={CaretLeftIcon}
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="disabled:opacity-40"
        />
        <ol className="hidden items-center gap-1 sm:flex">
          {getPageNumbers(page, totalPages).map((item, index) => (
            <li key={item === ELLIPSIS ? `${ELLIPSIS}-${index}` : item}>
              {item === ELLIPSIS ? (
                <span className="px-2 text-muted select-none">…</span>
              ) : (
                <button
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                  className={cn(
                    'size-9 cursor-pointer rounded-md text-sm tabular-nums transition-colors',
                    item === page ? 'bg-brand font-medium text-on-brand' : 'text-ink hover:bg-hover',
                  )}
                >
                  {item}
                </button>
              )}
            </li>
          ))}
        </ol>
        <span className="px-2 text-muted tabular-nums sm:hidden">
          Page {page} of {totalPages}
        </span>
        <IconButton
          icon={CaretRightIcon}
          label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="disabled:opacity-40"
        />
      </div>
    </nav>
  );
}
