"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ADVANCE_LABELS, TOURS, type TourSceneId } from "@/lib/tour";
import { useApp } from "./AppProvider";

interface TourProps {
  scene: TourSceneId;
  scenarioId: string;
  /** Called when the tour reaches a step whose anchor is not in the DOM yet
   *  (the answer card before the run finishes); the scene responds by
   *  skipping its animation to the end. */
  onMissingAnchor?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * The guided layer: a glowing ring around the current step's anchor and a
 * floating caption card with dots and keyboard control. Neither captures
 * pointer events over the page, so everything underneath stays clickable.
 */
export function Tour({ scene, scenarioId, onMissingAnchor }: TourProps) {
  const router = useRouter();
  const { tourActive, tourIndex, setTourIndex, setTourActive } = useApp();
  const steps = TOURS[scene];
  const index = Math.min(tourIndex[scene], steps.length - 1);
  const step = steps[index];
  const [rect, setRect] = useState<DOMRect | null>(null);

  // An anchor can exist twice (a desktop rail and a mobile strip, one of
  // them display none). Pick the one that actually has a box.
  const findAnchor = useCallback(() => {
    const els = document.querySelectorAll(`[data-tour="${step.anchor}"]`);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
    return null;
  }, [step.anchor]);

  const measure = useCallback(() => {
    const el = findAnchor();
    setRect(el ? el.getBoundingClientRect() : null);
  }, [findAnchor]);

  // Keep the ring glued to its anchor: re-measure on step change, on scroll
  // and resize, and poll briefly while the anchor has not mounted yet.
  useEffect(() => {
    if (!tourActive) return;
    const el = findAnchor();
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
      onMissingAnchor?.();
    }
    measure();
    const interval = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [tourActive, step.anchor, findAnchor, measure, onMissingAnchor]);

  const next = useCallback(() => {
    if (index < steps.length - 1) {
      setTourIndex(scene, index + 1);
    } else if (step.advanceTo) {
      router.push(`${step.advanceTo}?s=${scenarioId}`);
    }
  }, [index, steps.length, step.advanceTo, setTourIndex, scene, router, scenarioId]);

  const back = useCallback(() => {
    if (index > 0) setTourIndex(scene, index - 1);
  }, [index, setTourIndex, scene]);

  // Keyboard: arrows step, Escape dismisses, unless the visitor is typing.
  useEffect(() => {
    if (!tourActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") setTourActive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourActive, next, back, setTourActive]);

  if (!tourActive) return null;

  const lastLabel = step.advanceTo ? ADVANCE_LABELS[step.advanceTo] : "Done";

  return (
    <>
      {/* highlight ring */}
      {rect && (
        <div
          aria-hidden
          className="border-brand pointer-events-none fixed z-40 rounded-xl border-2 transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow:
              "0 0 0 4px color-mix(in srgb, var(--brand) 25%, transparent), 0 0 40px color-mix(in srgb, var(--brand) 35%, transparent)",
          }}
        />
      )}

      {/* caption card */}
      <aside
        className="panel-card fixed inset-x-3 bottom-3 z-50 p-4 shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-85"
        role="dialog"
        aria-label="Guided tour"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-faint font-mono text-[11px] tracking-wider uppercase">
            Step {index + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={() => setTourActive(false)}
            className="text-faint hover:text-ink -mt-1 -mr-1 cursor-pointer p-1"
            aria-label="Dismiss tour and explore freely"
          >
            <X className="size-4" />
          </button>
        </div>
        <h2 className="text-ink mt-1 text-[15px] font-bold">{step.title}</h2>
        <p className="text-mute mt-1.5 text-[13px] leading-relaxed">{step.body}</p>
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={back}
            disabled={index === 0}
            className="text-mute hover:text-ink inline-flex cursor-pointer items-center gap-1 text-xs font-bold disabled:cursor-default disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" /> Back
          </button>

          {steps.length > 1 && (
            <span className="flex items-center gap-1.5" aria-hidden={false}>
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTourIndex(scene, i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-1.5 cursor-pointer rounded-full transition-all ${
                    i === index ? "bg-brand w-4" : "bg-line hover:bg-faint w-1.5"
                  }`}
                />
              ))}
            </span>
          )}

          <button
            type="button"
            onClick={next}
            className="bg-brand-strong inline-flex cursor-pointer items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
          >
            {index === steps.length - 1 ? lastLabel : "Next"}
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
