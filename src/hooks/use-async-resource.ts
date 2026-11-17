"use client";

import { useEffect, useRef, useState } from "react";

export type AsyncResource<T> = {
  /** Loaded value for the current `key`, or `null` while absent/failed. */
  data: T | null;
  /** UI-safe message from the failed load, or `null`. */
  error: string | null;
  /** True while a load for the current `key` has not resolved yet. */
  loading: boolean;
};

type LoadedState<T> = {
  key: string;
  data: T | null;
  error: string | null;
};

/**
 * Runs an async loader whenever `key` changes and exposes it as
 * `{ data, error, loading }`.
 *
 * Why this exists: `react-hooks/set-state-in-effect` forbids calling
 * `setState` synchronously inside an effect body (the classic
 * "if (!uid) { setX([]); return; }" reset), and doing that reset correctly
 * without it requires keying the loaded value by the request identity.
 * This hook does exactly that:
 *
 *   - `key === null` → nothing to load: `loading` is false, `data` null.
 *   - `key` changes  → the previous value is no longer trusted, so `loading`
 *     flips to true immediately (derived, no setState) and a new load starts.
 *   - results are only committed from async callbacks, and stale responses
 *     are dropped via the cancellation flag.
 *
 * The loader itself is kept in a ref so callers may pass an inline closure
 * without re-triggering loads on every render.
 */
export function useAsyncResource<T>(
  key: string | null,
  load: () => Promise<T>
): AsyncResource<T> {
  const loadRef = useRef(load);
  const [state, setState] = useState<LoadedState<T> | null>(null);

  // Track the latest loader without making it a dependency of the load effect.
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ key, data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          key,
          data: null,
          error:
            err instanceof Error
              ? err.message
              : "Something went wrong while loading.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = key !== null && state?.key === key ? state : null;

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: key !== null && current === null,
  };
}
