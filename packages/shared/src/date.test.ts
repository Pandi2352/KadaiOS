import { describe, expect, it } from 'vitest';
import { shopDayKey, shopDayRange, shopMonthKey, shopMonthRange } from './date.js';

describe('shop days in India', () => {
  // 19:00 UTC on 5 November is already 00:30 on 6 November in India.
  const justAfterMidnight = new Date('2026-11-05T19:00:00.000Z');

  it('uses the shop date, not the UTC date', () => {
    expect(shopDayKey(justAfterMidnight)).toBe('2026-11-06');
  });

  it('starts and ends the day at Indian midnight', () => {
    const { start, end } = shopDayRange(justAfterMidnight);
    expect(start.toISOString()).toBe('2026-11-05T18:30:00.000Z');
    expect(end.toISOString()).toBe('2026-11-06T18:30:00.000Z');
  });

  it('includes the last moment of the day in the same day', () => {
    const lastMoment = new Date('2026-11-06T18:29:59.999Z');
    expect(shopDayKey(lastMoment)).toBe('2026-11-06');
    expect(shopDayRange(lastMoment).start.toISOString()).toBe('2026-11-05T18:30:00.000Z');
  });
});

describe('shop months', () => {
  it('moves into the next month by local time', () => {
    const date = new Date('2026-11-30T19:00:00.000Z');
    expect(shopMonthKey(date)).toBe('2026-12');
    const { start, end } = shopMonthRange(date);
    expect(start.toISOString()).toBe('2026-11-30T18:30:00.000Z');
    expect(end.toISOString()).toBe('2026-12-31T18:30:00.000Z');
  });

  it('rolls over the year', () => {
    const { end } = shopMonthRange(new Date('2026-12-15T00:00:00.000Z'));
    expect(end.toISOString()).toBe('2026-12-31T18:30:00.000Z');
  });
});

describe('time zones with daylight saving', () => {
  it('handles a 23-hour day', () => {
    const { start, end } = shopDayRange(new Date('2026-03-08T12:00:00.000Z'), 'America/New_York');
    expect(start.toISOString()).toBe('2026-03-08T05:00:00.000Z');
    expect(end.toISOString()).toBe('2026-03-09T04:00:00.000Z');
  });
});
