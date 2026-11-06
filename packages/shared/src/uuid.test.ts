import { describe, expect, it } from 'vitest';
import { generateUuid, isUuid } from './uuid.js';

describe('generateUuid', () => {
  it('creates valid, unique version 7 UUIDs', () => {
    const ids = Array.from({ length: 1000 }, generateUuid);
    expect(new Set(ids).size).toBe(1000);
    expect(ids.every(isUuid)).toBe(true);
    expect(ids[0].charAt(14)).toBe('7');
  });

  it('sorts by creation time', async () => {
    const first = generateUuid();
    await new Promise((resolve) => setTimeout(resolve, 2));
    expect(first < generateUuid()).toBe(true);
  });

  it('rejects values that are not UUIDs', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid(123)).toBe(false);
  });
});
