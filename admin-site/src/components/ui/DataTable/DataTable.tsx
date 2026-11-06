import { useState, type ReactNode } from 'react';
import { cn } from '@kadai/ui';
import { FILL_REMAINING } from '../fillStyles';
import { Table, type TableColumn, type SortDirection } from '../Table';
import { Pagination, type PaginationProps } from '../Pagination';
import { DataTableToolbar, type DataTableToolbarProps } from './DataTableToolbar';
import type { ViewMode } from './types';

export interface DataTableProps<T> {
  // Page Header (matching reference image)
  title?: string;
  subtitle?: string;
  subtitleInfo?: string;
  headerActions?: ReactNode;

  // Table Configuration
  caption: string;
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  emptyState?: ReactNode;

  // Toolbar Configuration
  toolbarProps?: Partial<DataTableToolbarProps>;
  showToolbar?: boolean;

  // Search
  searchable?: boolean;
  searchFilter?: (item: T, query: string) => boolean;

  // Sorting
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  onSortChange?: (column: string, direction: SortDirection) => void;

  // Ranking & Favorites
  showRank?: boolean;
  starable?: boolean;
  onToggleStar?: (key: string) => void;

  // Selection
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  renderBulkActions?: (selectedKeys: Set<string>, clearSelection: () => void) => ReactNode;

  // View Mode & Grid Rendering
  renderGridCard?: (item: T, index: number) => ReactNode;
  defaultViewMode?: ViewMode;

  // Pagination (controlled or automatic client-side)
  pagination?: Partial<PaginationProps>;
  pageSize?: number;
  showPagination?: boolean;

  // Export
  exportFilename?: string;

  // Density & Styling
  density?: 'comfortable' | 'compact';
  className?: string;
}

function filterAndSortData<T>(
  data: T[],
  searchQuery: string,
  searchFilter?: (item: T, query: string) => boolean,
  sortColumn?: string | null,
  sortDirection?: SortDirection,
): T[] {
  let result = [...data];

  // Client search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    if (searchFilter) {
      result = result.filter((item) => searchFilter(item, q));
    } else {
      result = result.filter((item) =>
        Object.values(item as Record<string, unknown>).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q),
        ),
      );
    }
  }

  // Client sort
  if (sortColumn && sortDirection) {
    result.sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortColumn];
      const valB = (b as Record<string, unknown>)[sortColumn];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA ?? '');
      const strB = String(valB ?? '');
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  return result;
}

export function DataTable<T>({
  title,
  subtitle,
  subtitleInfo,
  headerActions,
  caption,
  columns,
  data,
  rowKey,
  isLoading = false,
  isRefreshing = false,
  emptyState,
  toolbarProps,
  showToolbar = true,
  searchable = true,
  searchFilter,
  defaultSortColumn,
  defaultSortDirection = null,
  onSortChange,
  showRank = true,
  starable = true,
  onToggleStar,
  selectable = false,
  onSelectionChange,
  renderBulkActions,
  renderGridCard,
  defaultViewMode = 'table',
  pagination,
  pageSize = 10,
  showPagination = true,
  exportFilename = 'export',
  density = 'comfortable',
  className,
}: DataTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTimeframe, setActiveTimeframe] = useState('24h');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [starredKeys, setStarredKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(pagination?.page ?? 1);
  const [currentLimit, setCurrentLimit] = useState(pagination?.limit ?? pageSize);

  // Sorting Handler
  const handleSort = (key: string) => {
    let nextDirection: SortDirection = 'asc';
    if (sortColumn === key) {
      if (sortDirection === 'asc') nextDirection = 'desc';
      else if (sortDirection === 'desc') nextDirection = null;
      else nextDirection = 'asc';
    }

    setSortColumn(nextDirection ? key : null);
    setSortDirection(nextDirection);
    onSortChange?.(key, nextDirection);
  };

  // Star / Favorite Handler
  const handleToggleStar = (key: string) => {
    const next = new Set(starredKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setStarredKeys(next);
    onToggleStar?.(key);
  };

  // Selection Handlers
  const handleSelectRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
    onSelectionChange?.(next);
  };

  const handleSelectAll = () => {
    const next = new Set(selectedKeys);
    const isAll = filteredData.length > 0 && filteredData.every((item) => next.has(rowKey(item)));

    if (isAll) {
      filteredData.forEach((item) => next.delete(rowKey(item)));
    } else {
      filteredData.forEach((item) => next.add(rowKey(item)));
    }

    setSelectedKeys(next);
    onSelectionChange?.(next);
  };

  const clearSelection = () => {
    const next = new Set<string>();
    setSelectedKeys(next);
    onSelectionChange?.(next);
  };

  // Filtered & Sorted Data
  const filteredData = filterAndSortData(data, searchQuery, searchFilter, sortColumn, sortDirection);

  // Pagination Slice
  const isServerPaginated = Boolean(pagination?.onPageChange);
  const totalItems = pagination?.total ?? filteredData.length;
  const page = pagination?.page ?? currentPage;
  const limit = pagination?.limit ?? currentLimit;

  const displayData = isServerPaginated ? filteredData : filteredData.slice((page - 1) * limit, page * limit);

  // CSV Export
  const handleExportCSV = () => {
    const headers = columns.map((c) => (typeof c.header === 'string' ? c.header : c.key));
    const csvRows: string[] = [headers.join(',')];

    filteredData.forEach((row) => {
      const values = columns.map((c) => {
        const val = (row as Record<string, unknown>)[c.key];
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginationBar = showPagination && totalItems > 0 && (
    <Pagination
      page={page}
      limit={limit}
      total={totalItems}
      onPageChange={pagination?.onPageChange ?? setCurrentPage}
      onLimitChange={pagination?.onLimitChange ?? setCurrentLimit}
    />
  );

  return (
    <div className={cn('space-y-4', FILL_REMAINING, className)}>
      {/* Title Header matching reference image */}
      {(title || subtitle || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            {title && <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">
                {subtitle}
                {subtitleInfo && (
                  <span className="underline decoration-dotted ml-1 text-muted cursor-help" title={subtitleInfo}>
                    {subtitleInfo}
                  </span>
                )}
              </p>
            )}
          </div>
          {headerActions && <div className="shrink-0 flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Toolbar Controls matching reference image */}
      {showToolbar && (
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={searchable ? setSearchQuery : undefined}
          activeTimeframe={activeTimeframe}
          onTimeframeChange={setActiveTimeframe}
          viewMode={viewMode}
          onViewModeChange={renderGridCard ? setViewMode : undefined}
          showViewToggle={Boolean(renderGridCard)}
          onExport={handleExportCSV}
          {...toolbarProps}
        />
      )}

      {/* Floating / Inline Bulk Actions Bar */}
      {selectable && selectedKeys.size > 0 && renderBulkActions && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-md bg-brand-soft border border-brand/30 text-brand text-xs font-medium">
          <span>{selectedKeys.size} item(s) selected</span>
          <div className="flex items-center gap-2">{renderBulkActions(selectedKeys, clearSelection)}</div>
        </div>
      )}

      {/* Main Content: Table View or Grid/Card View */}
      {viewMode === 'table' || !renderGridCard ? (
        <Table<T>
          caption={caption}
          columns={columns}
          rows={displayData}
          rowKey={rowKey}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          emptyState={emptyState}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          showRank={showRank}
          rankStart={(page - 1) * limit + 1}
          starable={starable}
          starredKeys={starredKeys}
          onToggleStar={handleToggleStar}
          selectable={selectable}
          selectedKeys={selectedKeys}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          density={density}
          footer={paginationBar}
          fill
        />
      ) : (
        /* Grid / Cards View matching the grid icon */
        <>
          <div className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:overflow-y-auto">
            {displayData.map((item, idx) => (
              <div key={rowKey(item)}>{renderGridCard(item, (page - 1) * limit + idx)}</div>
            ))}
          </div>
          {paginationBar}
        </>
      )}
    </div>
  );
}
