import { useCallback, useEffect, useState } from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) setState((s) => ({ ...s, loading: true, error: null }));
        return fn();
      })
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((e: unknown) => {
        if (active) setState({ data: null, error: e instanceof Error ? e.message : 'Something went wrong', loading: false });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}
