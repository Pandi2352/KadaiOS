import { describe, expect, it } from 'vitest';
import { getInitials } from './getInitials';

describe('getInitials', () => {
  it.each([
    ['Default Admin', 'DA'],
    ['kavi', 'K'],
    ['Ponni Dairy Shop', 'PS'],
    ['  spaced   out  ', 'SO'],
    ['', ''],
  ])('turns %j into %j', (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});
