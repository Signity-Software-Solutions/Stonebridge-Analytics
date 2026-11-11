"use client";

import { useEffect, useRef } from "react";
import { MousePointerClick } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { useApp } from "./AppProvider";

/**
 * The first thing a visitor meets inside the workspace: one question,
 * remembered for the session. This dialog is what turns the guided tour on,
 * so visitors who want to wander are never chased by a tour card.
 */
export function WelcomeDialog() {
  const { tourChoice, chooseTour } = useApp();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const open = tourChoice === null;

  useEffect(() => {
    if (!open) return;
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") chooseTour("explore");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, chooseTour]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="bg-ink/40 absolute inset-0 backdrop-blur-[2px]"
        onClick={() => chooseTour("explore")}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="panel-card animate-rise relative w-full max-w-md p-6"
      >
        <BrandMark size={40} />
        <h2 id="welcome-title" className="text-ink mt-4 text-lg font-bold tracking-tight">
          Welcome to Stonebridge Analytics
        </h2>
        <p className="text-mute mt-1.5 text-[13px] leading-relaxed">
          You are signed in to the Harborlight Group workspace: governed
          claims reporting with a question dock on every report. Have a
          look around, or let the product introduce itself.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            ref={primaryRef}
            type="button"
            onClick={() => chooseTour("tour")}
            className="bg-brand-strong flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
          >
            Take the short tour
          </button>
          <button
            type="button"
            onClick={() => chooseTour("explore")}
            className="border-line text-mute hover:text-ink flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-bold transition"
          >
            <span className="inline-flex items-center gap-1.5">
              <MousePointerClick className="size-4" />
              Explore on my own
            </span>
          </button>
        </div>
        <p className="text-faint mt-3 text-[11px]">
          You can restart the tour any time from the top bar.
        </p>
      </div>
    </div>
  );
}
