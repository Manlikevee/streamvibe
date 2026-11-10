import { useCallback, useEffect, useState } from 'react';
import { readAsyncCache, writeAsyncCache } from '@/utils/asyncCache';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useCachedAsync<T>(fn: () => Promise<T>, cacheKey: string, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    let freshResolved = false;

    Promise.resolve().then(() => {
      if (active) setState((current) => ({ ...current, loading: true, error: null }));
    });

    readAsyncCache<T>(cacheKey).then((cached) => {
      if (active && !freshResolved && cached !== null) {
        setState((current) => ({ ...current, data: cached, error: null }));
      }
    });

    Promise.resolve()
      .then(fn)
      .then((data) => {
        freshResolved = true;
        void writeAsyncCache(cacheKey, data);
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (active) {
          setState((current) => ({
            ...current,
            error: error instanceof Error ? error.message : 'Something went wrong',
            loading: false,
          }));
        }
      });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, tick, ...deps]);

  const retry = useCallback(() => setTick((current) => current + 1), []);
  return { ...state, retry };
}
