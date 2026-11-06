import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon, StarIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@kadai/ui';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isRefreshing?: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  // Sorting
  sortColumn?: string | null;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  // Ranking & Favorites
  showRank?: boolean;
  rankStart?: number;
  starable?: boolean;
  starredKeys?: Set<string>;
  onToggleStar?: (key: string) => void;
  // Selection
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectRow?: (key: string) => void;
  onSelectAll?: () => void;
  // Sizing & Interactivity
  density?: 'comfortable' | 'compact';
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  className?: string;
}

export function Table<T>({
  caption,
  columns,
  rows,
  rowKey,
  isRefreshing = false,
  isLoading = false,
  skeletonRowCount = 5,
  sortColumn,
  sortDirection,
  onSort,
  showRank = false,
  rankStart = 1,
  starable = false,
  starredKeys,
  onToggleStar,
  selectable = false,
  selectedKeys,
  onSelectRow,
  onSelectAll,
  density = 'comfortable',
  onRowClick,
  emptyState,
  className,
}: TableProps<T>) {
  const isAllSelected = selectable && rows.length > 0 && selectedKeys && rows.every((r) => selectedKeys.has(rowKey(r)));
  const isSomeSelected =
    selectable && rows.length > 0 && selectedKeys && !isAllSelected && rows.some((r) => selectedKeys.has(rowKey(r)));

  const paddingClass = density === 'compact' ? 'py-2 px-3 text-xs' : 'py-3.5 px-4 text-sm';
  const headerPaddingClass = density === 'compact' ? 'py-2.5 px-3' : 'py-3 px-4';

  const totalCols = columns.length + (showRank || starable ? 1 : 0) + (selectable ? 1 : 0);

  return (
    <div
      className={cn('relative overflow-x-auto rounded-md border border-line bg-surface', className)}
      tabIndex={0}
      aria-label={caption}
    >
      <table className={cn('w-full border-collapse text-left', isRefreshing && 'opacity-60')} aria-busy={isRefreshing}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-canvas/40 text-xs font-semibold text-muted uppercase tracking-wider select-none">
            {/* Selection Checkbox Header */}
            {selectable && (
              <th scope="col" className={cn(headerPaddingClass, 'w-10 text-center')}>
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = Boolean(isSomeSelected);
                  }}
                  onChange={onSelectAll}
                  className="rounded-md border-line text-brand focus:ring-brand cursor-pointer"
                />
              </th>
            )}

            {/* Rank & Star Combined Header */}
            {(showRank || starable) && (
              <th scope="col" className={cn(headerPaddingClass, 'w-16 text-center')}>
                <div className="flex items-center justify-center gap-1.5 text-muted">
                  {starable && <StarIcon size={14} aria-hidden />}
                  {showRank && <span>#</span>}
                </div>
              </th>
            )}

            {/* Main Columns */}
            {columns.map((column) => {
              const isSorted = sortColumn === column.key;
              const isSortable = column.sortable && Boolean(onSort);

              return (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    headerPaddingClass,
                    'font-semibold whitespace-nowrap',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    isSortable && 'cursor-pointer hover:text-ink transition-colors',
                    column.className,
                  )}
                  onClick={() => isSortable && onSort?.(column.key)}
                >
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      column.align === 'right' && 'flex-row-reverse text-right',
                      column.align === 'center' && 'justify-center',
                    )}
                  >
                    <span>{column.header}</span>
                    {isSortable && (
                      <span className="text-muted/70">
                        {isSorted && sortDirection === 'asc' && (
                          <CaretUpIcon size={13} weight="bold" className="text-brand" />
                        )}
                        {isSorted && sortDirection === 'desc' && (
                          <CaretDownIcon size={13} weight="bold" className="text-brand" />
                        )}
                        {(!isSorted || !sortDirection) && <CaretUpDownIcon size={13} />}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {/* Loading Skeletons */}
          {isLoading &&
            Array.from({ length: skeletonRowCount }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                {selectable && (
                  <td className={cn(paddingClass, 'text-center')}>
                    <div className="h-4 w-4 mx-auto rounded-md bg-line/60" />
                  </td>
                )}
                {(showRank || starable) && (
                  <td className={cn(paddingClass, 'text-center')}>
                    <div className="h-4 w-8 mx-auto rounded-md bg-line/60" />
                  </td>
                )}
                {columns.map((col, cIdx) => (
                  <td key={`skel-col-${cIdx}`} className={paddingClass}>
                    <div
                      className={cn(
                        'h-4 rounded-md bg-line/60',
                        col.align === 'right' ? 'ml-auto w-16' : col.align === 'center' ? 'mx-auto w-12' : 'w-3/4',
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty State */}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={totalCols} className="py-12 text-center text-muted">
                {emptyState ?? 'No records found.'}
              </td>
            </tr>
          )}

          {/* Data Rows */}
          {!isLoading &&
            rows.map((row, index) => {
              const key = rowKey(row);
              const isSelected = selectedKeys?.has(key);
              const isStarred = starredKeys?.has(key);

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'bg-brand-soft/40' : 'hover:bg-brand-soft/15',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {/* Selection Checkbox */}
                  {selectable && (
                    <td
                      className={cn(paddingClass, 'w-10 text-center')}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRow?.(key);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow?.(key)}
                        className="rounded-md border-line text-brand focus:ring-brand cursor-pointer"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}

                  {/* Rank & Star Combined Cell */}
                  {(showRank || starable) && (
                    <td className={cn(paddingClass, 'w-16 text-center')}>
                      <div className="flex items-center justify-center gap-2">
                        {starable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStar?.(key);
                            }}
                            className={cn(
                              'cursor-pointer transition-colors p-0.5 rounded-md hover:bg-hover',
                              isStarred ? 'text-warning' : 'text-muted/40 hover:text-warning',
                            )}
                            aria-label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <StarIcon size={16} weight={isStarred ? 'fill' : 'regular'} />
                          </button>
                        )}
                        {showRank && (
                          <span className="font-mono text-xs font-medium text-muted/70">{rankStart + index}</span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Columns */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        paddingClass,
                        'text-ink',
                        column.align === 'right' && 'text-right tabular-nums',
                        column.align === 'center' && 'text-center',
                        column.className,
                      )}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
