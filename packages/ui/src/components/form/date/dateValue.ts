import { formatShopDate, shopDayKey } from '@kadai/shared';

/**
 * Dates here are plain calendar days such as 2026-11-06, with no time and no time zone. The
 * calculations use UTC so a day never shifts because of the browser's own time zone.
 */
const toDate = (key: string) => new Date(`${key}T00:00:00.000Z`);
const toKey = (date: Date) => date.toISOString().slice(0, 10);
const DAYS_IN_GRID = 42;

export const WEEKDAYS = [
  { short: 'Su', long: 'Sunday' },
  { short: 'Mo', long: 'Monday' },
  { short: 'Tu', long: 'Tuesday' },
  { short: 'We', long: 'Wednesday' },
  { short: 'Th', long: 'Thursday' },
  { short: 'Fr', long: 'Friday' },
  { short: 'Sa', long: 'Saturday' },
];

export const todayKey = () => shopDayKey(new Date());

export const formatDateKey = (key: string) => formatShopDate(toDate(key), 'UTC');

export const formatMonth = (key: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(toDate(key));

export const addDays = (key: string, days: number) => {
  const date = toDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toKey(date);
};

/** Stays inside the target month, so 31 January plus one month is 28 February and not March. */
export const addMonths = (key: string, months: number) => {
  const date = toDate(key);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return toKey(date);
};

export const startOfWeek = (key: string) => addDays(key, -toDate(key).getUTCDay());
export const endOfWeek = (key: string) => addDays(startOfWeek(key), 6);
export const isSameMonth = (first: string, second: string) => first.slice(0, 7) === second.slice(0, 7);

/** Six full weeks, so the calendar keeps the same height from month to month. */
export const monthGrid = (key: string): string[] => {
  const first = startOfWeek(`${key.slice(0, 7)}-01`);
  return Array.from({ length: DAYS_IN_GRID }, (_, index) => addDays(first, index));
};

export const isInRange = (key: string, min?: string, max?: string) =>
  (min === undefined || key >= min) && (max === undefined || key <= max);

export const clampDate = (key: string, min?: string, max?: string) => {
  if (min !== undefined && key < min) return min;
  if (max !== undefined && key > max) return max;
  return key;
};

export const isMonthInRange = (key: string, min?: string, max?: string) => {
  const month = key.slice(0, 7);
  return (min === undefined || month >= min.slice(0, 7)) && (max === undefined || month <= max.slice(0, 7));
};
