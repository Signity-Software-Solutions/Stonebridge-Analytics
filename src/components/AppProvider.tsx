"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TourSceneId } from "@/lib/tour";

/**
 * The only mutable state in the whole app: whether the visitor chose the
 * guided tour and where each screen's tour is. Everything else derives from
 * the URL (?s=<scenario>) and elapsed time.
 */

export type TourChoice = "tour" | "explore";

const STORAGE_KEY = "stonebridge-tour-choice";

/* sessionStorage can throw (private windows, blocked site data); the app
 * must shrug that off. In-memory state still prevents re-prompting within
 * the session. */
function readChoice(): TourChoice | null {
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v === "tour" || v === "explore" ? v : null;
  } catch {
    return null;
  }
}
function writeChoice(choice: TourChoice) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* fine, the context value carries it for this session */
  }
}

interface AppState {
  /** null until the visitor answers the welcome dialog (or storage recalls it). */
  tourChoice: TourChoice | null;
  chooseTour: (choice: TourChoice) => void;
  tourActive: boolean;
  tourIndex: Record<TourSceneId, number>;
  setTourActive: (active: boolean) => void;
  setTourIndex: (scene: TourSceneId, index: number) => void;
  restartTour: (scene: TourSceneId) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tourActive, setTourActive] = useState(false);
  const [tourChoice, setTourChoice] = useState<TourChoice | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [tourIndex, setTourIndexState] = useState<Record<TourSceneId, number>>({
    home: 0,
    reports: 0,
    spend: 0,
    analytics: 0,
  });

  // Recall a previous answer AFTER mount; reading storage in the initializer
  // would make the server and client render different first frames.
  useEffect(() => {
    const stored = readChoice();
    if (stored) {
      setTourChoice(stored);
      if (stored === "tour") setTourActive(true);
    }
    setHydrated(true);
  }, []);

  const chooseTour = useCallback((choice: TourChoice) => {
    writeChoice(choice);
    setTourChoice(choice);
    setTourActive(choice === "tour");
  }, []);

  const setTourIndex = useCallback((scene: TourSceneId, index: number) => {
    setTourIndexState((prev) => ({ ...prev, [scene]: index }));
  }, []);

  const restartTour = useCallback(
    (scene: TourSceneId) => {
      setTourIndex(scene, 0);
      writeChoice("tour");
      setTourChoice("tour");
      setTourActive(true);
    },
    [setTourIndex],
  );

  const value = useMemo(
    () => ({
      // Report "explore" until hydration so the dialog never flashes during SSR.
      tourChoice: hydrated ? tourChoice : "explore",
      chooseTour,
      tourActive,
      tourIndex,
      setTourActive,
      setTourIndex,
      restartTour,
    }),
    [hydrated, tourChoice, chooseTour, tourActive, tourIndex, setTourIndex, restartTour],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
