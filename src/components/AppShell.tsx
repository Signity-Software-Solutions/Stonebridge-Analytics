"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  Sparkles,
  FileBarChart2,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import type { TourSceneId } from "@/lib/tour";
import { useApp } from "./AppProvider";
import { ScenarioPicker } from "./ScenarioPicker";
import { useScenarios, useWorkspace } from "./WorkspaceProvider";
import { WelcomeDialog } from "./WelcomeDialog";

/**
 * The frame every screen lives in: left sidebar, top bar, avatar menu and
 * the welcome dialog. One component for the whole product.
 */

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/home" },
  { label: "Ask the data", icon: Sparkles, href: "/ask" },
  { label: "Reports", icon: FileBarChart2, href: "/reports" },
  { label: "Usage", icon: Gauge, href: "/analytics" },
  { label: "Clients", icon: Building2, href: "/clients" },
  { label: "Activity", icon: History, href: "/activity" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface AppShellProps {
  tourScene: TourSceneId;
  /** Show the question pills (the report screen only). */
  withScenario?: boolean;
  children: ReactNode;
}

export function AppShell({ tourScene, withScenario = false, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const scenarioId = useSearchParams().get("s");
  const { getScenario } = useScenarios();
  const persona = useWorkspace();
  const scenario = getScenario(scenarioId);
  const { restartTour } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = persona.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const navFor = (item: NavItem) => {
    const active =
      item.href === pathname || (item.href !== "/home" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.label}
        href={`${item.href}?s=${scenario.id}`}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold transition ${
          active ? "bg-side-tint text-white" : "text-side-mute hover:bg-side-tint/60 hover:text-side-ink"
        }`}
        aria-current={active ? "page" : undefined}
      >
        <item.icon className="size-4" />
        {item.label}
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href={`/home?s=${scenario.id}`} className="flex items-center gap-2.5 px-3 py-1" title="Stonebridge Analytics home">
        <BrandMark size={32} />
        <span className="flex flex-col leading-tight">
          <span className="text-side-ink text-[14px] font-bold tracking-tight">Stonebridge</span>
          <span className="text-side-mute text-[9px] font-bold tracking-[0.18em] uppercase">Analytics</span>
        </span>
      </Link>
      <nav className="mt-6 flex flex-col gap-0.5" aria-label="Main navigation">
        {NAV.map(navFor)}
      </nav>
      <div className="mt-auto px-3 pb-1">
        <p className="text-side-mute text-[11px] font-bold">{persona.company}</p>
        <p className="text-side-mute/70 text-[10px]">Workspace</p>
      </div>
    </div>
  );

  return (
    <div className="theme-app bg-canvas min-h-screen">
      <div className="flex min-h-screen">
        {/* desktop sidebar */}
        <aside className="border-side-line bg-side sticky top-0 hidden h-screen w-60 shrink-0 border-r px-3 py-4 lg:block">
          {sidebar}
        </aside>

        {/* mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="bg-ink/40 absolute inset-0" onClick={() => setDrawerOpen(false)} aria-hidden />
            <div className="bg-side animate-rise absolute inset-y-0 left-0 w-64 px-3 py-4 shadow-2xl">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-side-mute hover:text-side-ink absolute top-4 right-3 cursor-pointer p-1"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* top bar */}
          <header className="border-line/70 bg-surface/80 sticky top-0 z-30 border-b backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="text-mute hover:text-ink -ml-1 cursor-pointer p-1 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>

              {/* decorative search */}
              <div
                aria-hidden
                className="border-line bg-hairline/60 text-faint hidden h-8 w-56 items-center gap-2 rounded-lg border px-2.5 text-[12px] md:flex"
              >
                <Search className="size-3.5" />
                Search reports and clients
              </div>

              <div className="ml-auto flex items-center gap-2.5">
                {withScenario && <ScenarioPicker current={scenario.id} />}
                <button
                  type="button"
                  onClick={() => restartTour(tourScene)}
                  className="text-mute hover:text-ink inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold whitespace-nowrap"
                  title="Restart the guided tour for this screen"
                >
                  <RefreshCw className="size-3" />
                  Tour
                </button>
                <span className="text-faint relative hidden sm:block">
                  <Bell className="size-4" />
                  <span className="bg-brand absolute -top-0.5 -right-0.5 size-1.5 rounded-full" />
                </span>

                {/* avatar menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="bg-brand-strong flex size-8 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Account menu"
                  >
                    {initials}
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="border-line bg-surface animate-rise absolute right-0 z-40 mt-2 w-56 rounded-xl border p-1.5 shadow-xl"
                    >
                      <div className="px-2.5 py-2">
                        <p className="text-ink text-[13px] font-bold">{persona.name}</p>
                        <p className="text-faint text-[11px]">{persona.role}</p>
                      </div>
                      <div className="bg-hairline my-1 h-px" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/login");
                        }}
                        className="text-mute hover:bg-hairline hover:text-ink flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-bold"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <WelcomeDialog />
    </div>
  );
}
