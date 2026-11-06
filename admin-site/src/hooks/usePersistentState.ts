import { useCallback, useState } from 'react';

type Validator<T> = (value: unknown) => value is T;

function readStored<T>(key: string, fallback: T, isValid?: Validator<T>): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return !isValid || isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * useState that survives a reload. Falls back to memory if storage is blocked. Pass isValid
 * for values the app depends on, because stored data can be old or edited.
 */
export function usePersistentState<T>(key: string, fallback: T, isValid?: Validator<T>) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, isValid));

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage is blocked, so the value lasts for this session only.
      }
    },
    [key],
  );

  return [value, update] as const;
}
