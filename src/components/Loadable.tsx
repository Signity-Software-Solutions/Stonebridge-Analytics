"use client";

import type { ReactNode } from "react";
import { CircleAlert, Loader2, RotateCcw } from "lucide-react";
import { API_BASE_URL, type ApiError } from "@/lib/api";
import type { AsyncState } from "@/hooks/useAsync";

/** Centered, card-width loading state for a screen whose data is on its way. */
export function LoadingPanel({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="panel-card flex items-center gap-3 p-5">
        <Loader2 className="text-brand size-4 shrink-0 animate-spin" />
        <p className="text-mute text-[13px] font-bold">{label}</p>
      </div>
      <div aria-hidden className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="bg-shimmer animate-shimmer h-28 rounded-xl" />
        <div className="bg-shimmer animate-shimmer h-28 rounded-xl" />
      </div>
    </div>
  );
}

/** What went wrong, in plain words, with a way to try again. */
export function ErrorPanel({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const unreachable = error.status === 0;
  return (
    <div role="alert" className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <div className="panel-card p-6">
        <div className="flex items-start gap-3">
          <span className="bg-err-soft text-err flex size-8 shrink-0 items-center justify-center rounded-full">
            <CircleAlert className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-ink text-[15px] font-bold">
              {unreachable ? "Can't reach the Stonebridge API" : "This screen could not be loaded"}
            </h2>
            <p className="text-mute mt-1 text-[13px] leading-relaxed">
              {unreachable
                ? `Nothing answered at ${API_BASE_URL}. Check that the backend is running and that NEXT_PUBLIC_API_BASE_URL points at it.`
                : error.message}
            </p>
            {error.requestId && (
              <p className="text-faint mt-2 font-mono text-[11px]">Request id {error.requestId}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="bg-brand-strong mt-5 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold text-white shadow-md transition hover:brightness-110"
        >
          <RotateCcw className="size-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}

/**
 * Renders `children` once the data has arrived, a loading panel while it is on
 * its way, and an error panel with a retry if it failed.
 */
export function Loadable<T>({
  state,
  label,
  children,
}: {
  state: AsyncState<T>;
  label?: string;
  children: (data: T) => ReactNode;
}) {
  if (state.data) return <>{children(state.data)}</>;
  if (state.loading || !state.error) return <LoadingPanel label={label} />;
  return <ErrorPanel error={state.error} onRetry={state.retry} />;
}
