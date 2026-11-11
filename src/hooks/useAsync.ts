"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  /** Run the load again, for the error panel's Retry button. */
  retry: () => void;
}

/**
 * Runs `load` when the component mounts and tracks its progress. The loader
 * is read through a ref, so callers can pass an inline arrow function; it only
 * re-runs on mount and on retry(). Requests are cached by lib/api.ts, so two
 * components loading the same endpoint share one network call.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: ApiError | null }>({
    data: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error =
          err instanceof ApiError
            ? err
            : new ApiError(0, "unexpected_error", "Something went wrong loading this screen.");
        setState({ data: null, error });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data: state.data, error: state.error, loading, retry };
}
