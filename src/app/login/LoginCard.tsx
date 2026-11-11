"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Lock, MessageCircleQuestion, ShieldCheck, Table2 } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Sparkline } from "@/components/Sparkline";
import { PERSONA } from "@/lib/data";

const FEATURES = [
  { icon: Table2, text: "Curated reports, faithful to the governed model" },
  { icon: MessageCircleQuestion, text: "A plain English question dock on every report" },
  { icon: ShieldCheck, text: "Protected fields stay protected, visibly" },
];

/**
 * The front door: the sign in column beside a dark product panel with a
 * floating preview of the workspace. The fields are read only and the SSO
 * button signs the visitor in as the workspace analyst.
 */
export function LoginCard() {
  const router = useRouter();
  const s = useSearchParams().get("s");
  const enter = () => router.push(`/home${s ? `?s=${s}` : ""}`);

  return (
    <div className="theme-app bg-canvas flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-4xl items-stretch gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* sign in column */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <BrandMark size={44} />
            <div className="leading-tight">
              <p className="text-ink text-xl font-bold tracking-tight">Stonebridge Analytics</p>
              <p className="text-mute text-[12.5px]">Every claim, accounted for.</p>
            </div>
          </div>

          <div className="panel-card mt-6 p-6">
            <h2 className="text-ink text-lg font-bold tracking-tight">Sign in</h2>
            <p className="text-faint mt-0.5 text-[12px]">Use your company account.</p>

            <label className="text-faint mt-5 block text-[10px] font-bold tracking-widest uppercase">
              Work email
            </label>
            <div className="border-line bg-hairline/50 mt-1 flex h-11 items-center gap-2 rounded-lg border px-3">
              <input
                readOnly
                value={PERSONA.email}
                className="text-mute w-full flex-1 bg-transparent text-[13px] outline-none"
                aria-label="Work email"
              />
              <Lock className="text-faint size-3.5 shrink-0" />
            </div>

            <label className="text-faint mt-3.5 block text-[10px] font-bold tracking-widest uppercase">
              Password
            </label>
            <div className="border-line bg-hairline/50 mt-1 flex h-11 items-center gap-2 rounded-lg border px-3">
              <input
                readOnly
                type="password"
                value="placeholder"
                className="text-mute w-full flex-1 bg-transparent text-[13px] tracking-[0.3em] outline-none"
                aria-label="Password"
              />
              <Lock className="text-faint size-3.5 shrink-0" />
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="bg-hairline h-px flex-1" />
              <span className="text-faint text-[10px] font-bold tracking-widest uppercase">or</span>
              <span className="bg-hairline h-px flex-1" />
            </div>

            <button
              type="button"
              onClick={enter}
              className="bg-brand-strong flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110"
            >
              <KeyRound className="size-4" />
              Continue with {PERSONA.company} SSO
            </button>
          </div>

          <p className="text-faint mt-4 text-[11px]">
            Stonebridge for {PERSONA.company}. Signed in as {PERSONA.name}, {PERSONA.role}.
          </p>
        </div>

        {/* product panel */}
        <div className="bg-side relative hidden flex-col justify-between overflow-hidden rounded-2xl p-7 lg:flex">
          <p className="text-side-ink max-w-sm text-[20px] leading-snug font-bold tracking-tight">
            One governed model. Every report, every chart, every answer reads from it.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {/* floating preview: spend trend */}
            <div className="border-side-line rounded-xl border bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-side-ink text-[12.5px] font-bold">Program paid, year to date</p>
                <span className="text-side-mute text-[10.5px]">live</span>
              </div>
              <p className="text-side-ink mt-1 text-[22px] font-bold tracking-tight">$21.2M</p>
              <div className="mt-2">
                <Sparkline
                  points={[1.82, 1.96, 1.54, 2.08, 2.23, 2.41, 2.15, 2.32, 2.19]}
                  width={340}
                  height={56}
                  color="#a5b4fc"
                />
              </div>
            </div>

            {/* floating preview: an answered question */}
            <div className="border-side-line rounded-xl border bg-white/[0.04] p-4">
              <p className="text-side-mute text-[10px] font-bold tracking-[0.14em] uppercase">
                Ask this report
              </p>
              <p className="text-side-ink mt-1.5 text-[13px] font-semibold">
                Paid by claim category this fiscal year
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-bold text-[#a5b4fc]">
                  Answered in 6.2s
                </span>
                <span className="text-side-mute text-[11px]">saved to the report</span>
              </div>
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <li key={f.text} className="text-side-mute flex items-center gap-2.5 text-[12.5px]">
                <f.icon className="size-4 shrink-0 text-[#a5b4fc]" />
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
