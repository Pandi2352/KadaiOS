export type ViewMode = 'table' | 'grid';

export interface TimeframeOption {
  key: string;
  label: string;
}

export const DEFAULT_TIMEFRAMES: TimeframeOption[] = [
  { key: 'all', label: 'All Time' },
  { key: '30d', label: '30d' },
  { key: '7d', label: '7d' },
  { key: '24h', label: '24h' },
  { key: '6h', label: '6hr' },
  { key: '1h', label: '1hr' },
];

