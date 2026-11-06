import { describe, expect, it } from 'vitest';
import { getPageNumbers } from './pageNumbers';

describe('getPageNumbers', () => {
  it('shows every page when they fit', () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(getPageNumbers(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps the first and last in reach from anywhere', () => {
    expect(getPageNumbers(2, 20)).toEqual([1, 2, 3, 4, 'ellipsis', 20]);
    expect(getPageNumbers(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
    expect(getPageNumbers(19, 20)).toEqual([1, 'ellipsis', 17, 18, 19, 20]);
  });
});
