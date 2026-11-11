"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StepStatus } from "@/lib/types";

/**
 * The engine behind the Ask dock. One requestAnimationFrame loop accumulates
 * elapsed milliseconds; every status, index and progress value is DERIVED
 * from that single number against the cumulative step durations. Skip and
 * restart only move `elapsed`, so the UI cannot disagree with itself.
 *
 * `prefers-reduced-motion` starts the timeline already finished, so those
 * visitors see the completed state instantly.
 */
export function useScriptedTimeline(durations: number[]) {
  const total = useMemo(
    () => durations.reduce((sum, d) => sum + d, 0),
    [durations],
  );
  const cumulative = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const d of durations) {
      acc += d;
      out.push(acc);
    }
    return out;
  }, [durations]);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const lastTick = useRef<number | null>(null);

  // Reduced motion: jump straight to the end, once, on mount.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(total);
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing || elapsed >= total) return;
    let frame: number;
    const tick = (now: number) => {
      if (lastTick.current != null) {
        const delta = now - lastTick.current;
        setElapsed((e) => Math.min(total, e + delta));
      }
      lastTick.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastTick.current = null;
    };
  }, [playing, elapsed >= total]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = elapsed >= total;
  const activeIndex = done ? durations.length : cumulative.findIndex((c) => elapsed < c);

  const statuses: StepStatus[] = durations.map((_, i) =>
    i < activeIndex ? "completed" : i === activeIndex ? "processing" : "pending",
  );

  const stepStart = activeIndex > 0 ? cumulative[activeIndex - 1] : 0;
  const stepProgress = done
    ? 1
    : (elapsed - stepStart) / (durations[activeIndex] || 1);

  /** 0 to 1 across the whole timeline, for the progress bar. */
  const overallProgress = total === 0 ? 1 : Math.min(1, elapsed / total);

  const skipToEnd = useCallback(() => setElapsed(total), [total]);
  const restart = useCallback(() => {
    lastTick.current = null;
    setElapsed(0);
    setPlaying(true);
  }, []);

  return {
    statuses,
    activeIndex,
    stepProgress,
    overallProgress,
    elapsedMs: elapsed,
    done,
    playing,
    skipToEnd,
    restart,
  };
}
