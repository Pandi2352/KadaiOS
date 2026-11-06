import {
  DownloadSimpleIcon,
  FunnelIcon,
  ListDashesIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { cn } from '@kadai/ui';
import { DEFAULT_TIMEFRAMES, type TimeframeOption, type ViewMode } from './types';

export interface DataTableToolbarProps {
  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  // Category / Filter Dropdown Slot
  filterSlot?: ReactNode;
  // Filter Pill
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  filterButtonLabel?: string;
  // Live Status Indicator
  showLiveIndicator?: boolean;
  liveIndicatorLabel?: string;
  // Timeframe Tabs
  timeframes?: TimeframeOption[];
  activeTimeframe?: string;
  onTimeframeChange?: (key: string) => void;
  // View Switcher (Table vs Grid)
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  // Export
  onExport?: () => void;
  className?: string;
  children?: ReactNode;
}

export function DataTableToolbar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search collections...',
  filterSlot,
  onFilterClick,
  isFilterActive = false,
  filterButtonLabel = 'Filters',
  showLiveIndicator = true,
  liveIndicatorLabel = 'LIVE',
  timeframes = DEFAULT_TIMEFRAMES,
  activeTimeframe = '24h',
  onTimeframeChange,
  viewMode = 'table',
  onViewModeChange,
  showViewToggle = true,
  onExport,
  className,
  children,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn('flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-2', className)}
    >
      {/* Left side: Dropdown, Search bar, Filter pill */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {filterSlot}

        {/* Search input with modern styling matching reference image */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-md border border-line bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:border-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                aria-label="Clear search"
              >
                <XIcon size={13} weight="bold" />
              </button>
            )}
          </div>
        )}

        {/* Quick Filter Pill */}
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer',
              isFilterActive
                ? 'bg-brand-soft border-brand text-brand'
                : 'bg-surface border-line text-muted hover:text-ink hover:bg-hover',
            )}
          >
            <FunnelIcon size={14} weight={isFilterActive ? 'fill' : 'regular'} />
            <span>{filterButtonLabel}</span>
          </button>
        )}

        {children}
      </div>

      {/* Right side: Live status, Timeframe tabs, View switcher, Export */}
      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 overflow-x-auto pb-1 lg:pb-0">
        {/* Live indicator dot */}
        {showLiveIndicator && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{liveIndicatorLabel}</span>
          </div>
        )}

        {/* Timeframe switch tabs matching reference image with active underline */}
        {onTimeframeChange && timeframes.length > 0 && (
          <div className="flex items-center gap-0.5 border-b border-transparent">
            {timeframes.map((tf) => {
              const isActive = tf.key === activeTimeframe;
              return (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => onTimeframeChange(tf.key)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium transition-all relative cursor-pointer',
                    isActive ? 'text-brand font-semibold' : 'text-muted hover:text-ink',
                  )}
                >
                  {tf.label}
                  {isActive && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-brand rounded-full" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Export Button */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-hover border border-line cursor-pointer shrink-0"
            title="Export to CSV"
            aria-label="Export to CSV"
          >
            <DownloadSimpleIcon size={16} />
          </button>
        )}

        {/* View mode toggle (Table vs Grid) matching the rightmost icon in reference image */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center rounded-md border border-line p-0.5 bg-canvas/60 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-label="Table View"
              title="Table View"
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                viewMode === 'table' ? 'bg-surface text-brand shadow-none font-semibold' : 'text-muted hover:text-ink',
              )}
            >
              <ListDashesIcon size={16} weight={viewMode === 'table' ? 'bold' : 'regular'} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid View"
              title="Grid View"
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                viewMode === 'grid' ? 'bg-surface text-brand shadow-none font-semibold' : 'text-muted hover:text-ink',
              )}
            >
              <SquaresFourIcon size={16} weight={viewMode === 'grid' ? 'bold' : 'regular'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
