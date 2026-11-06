import { isBusinessType } from '@kadai/shared';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePersistentState } from './usePersistentState';

const KEY = 'test.value';

describe('usePersistentState', () => {
  beforeEach(() => localStorage.clear());

  it('saves and restores values', () => {
    const first = renderHook(() => usePersistentState(KEY, 'a'));
    act(() => first.result.current[1]('b'));

    const second = renderHook(() => usePersistentState(KEY, 'a'));
    expect(second.result.current[0]).toBe('b');
  });

  it('falls back when stored JSON is corrupt', () => {
    localStorage.setItem(KEY, '{not json');
    const { result } = renderHook(() => usePersistentState(KEY, 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('falls back when a stored value fails validation, like an unknown business type', () => {
    localStorage.setItem(KEY, '"bakery"');
    const { result } = renderHook(() => usePersistentState(KEY, 'meat', isBusinessType));
    expect(result.current[0]).toBe('meat');
  });

  it('keeps a stored value that passes validation', () => {
    localStorage.setItem(KEY, '"dairy"');
    const { result } = renderHook(() => usePersistentState(KEY, 'meat', isBusinessType));
    expect(result.current[0]).toBe('dairy');
  });
});
