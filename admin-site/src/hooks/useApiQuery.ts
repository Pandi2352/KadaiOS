import { useCallback, useEffect, useRef, useState } from 'react';

interface QueryResult<T> {
  /** Which request this result belongs to. */
  requestKey: string;
  data?: T;
  error?: unknown;
}

export interface ApiQuery<T> {
  /** Keeps the last result during a reload, so tables don't flash empty between pages. */
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Loads data when the component mounts and whenever `key` changes. A newer request
 * cancels the older one, so a slow response can never overwrite a newer result.
 */
export function useApiQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>, key: string): ApiQuery<T> {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<QueryResult<T> | null>(null);
  const [lastData, setLastData] = useState<T>();
  const fetcherRef = useRef(fetcher);
  const requestKey = `${key}#${attempt}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        setLastData(data);
        setResult({ requestKey, data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ requestKey, error });
      });

    return () => controller.abort();
  }, [requestKey]);

  const refetch = useCallback(() => setAttempt((current) => current + 1), []);
  const isCurrent = result?.requestKey === requestKey;

  return {
    data: lastData,
    error: isCurrent ? result.error : undefined,
    isLoading: !isCurrent,
    refetch,
  };
}
