export const DEFAULT_SHOP_TIMEZONE = 'Asia/Kolkata';

export interface DateRange {
  start: Date;
  /** Exclusive: query with `>= start` and `< end`. */
  end: Date;
}

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getLocalParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

function offsetMs(date: Date, timeZone: string): number {
  const { year, month, day, hour, minute, second } = getLocalParts(date, timeZone);
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return Date.UTC(year, month - 1, day, hour, minute, second) - wholeSeconds;
}

function localMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const utcGuess = Date.UTC(year, month - 1, day);
  const first = utcGuess - offsetMs(new Date(utcGuess), timeZone);
  // A second pass corrects the result when the offset changes between the guess and midnight.
  return new Date(utcGuess - offsetMs(new Date(first), timeZone));
}

const pad = (value: number) => String(value).padStart(2, '0');

/** The shop's calendar date, such as 2026-11-06. */
export function shopDayKey(date: Date, timeZone: string = DEFAULT_SHOP_TIMEZONE): string {
  const { year, month, day } = getLocalParts(date, timeZone);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** The shop's calendar month, such as 2026-11. */
export function shopMonthKey(date: Date, timeZone: string = DEFAULT_SHOP_TIMEZONE): string {
  const { year, month } = getLocalParts(date, timeZone);
  return `${year}-${pad(month)}`;
}

/** A date for people to read, such as 6 Nov 2026. */
export function formatShopDate(date: Date, timeZone: string = DEFAULT_SHOP_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone, day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** The instants where the shop's calendar day starts and ends, which differ from the UTC day. */
export function shopDayRange(date: Date, timeZone: string = DEFAULT_SHOP_TIMEZONE): DateRange {
  const { year, month, day } = getLocalParts(date, timeZone);
  return { start: localMidnight(year, month, day, timeZone), end: localMidnight(year, month, day + 1, timeZone) };
}

export function shopMonthRange(date: Date, timeZone: string = DEFAULT_SHOP_TIMEZONE): DateRange {
  const { year, month } = getLocalParts(date, timeZone);
  return { start: localMidnight(year, month, 1, timeZone), end: localMidnight(year, month + 1, 1, timeZone) };
}
