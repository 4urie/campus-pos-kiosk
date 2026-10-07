"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, MapPin, Store } from "lucide-react";

interface HeaderProps {
  /** Shows a kiosk toast for header actions (e.g. staff help). */
  onNotify: (message: string) => void;
}

/** Format the time like the kiosk clock in the reference design: "10:07 AM". */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Format the date like the reference design: "Wed, Oct 7". */
function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export default function Header({ onNotify }: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [language, setLanguage] = useState<"EN" | "FIL">("EN");

  // Live clock, re-synced every second. Starts empty on the server so
  // the initial render is hydration-safe.
  useEffect(() => {
    const sync = () => setNow(new Date());
    sync();
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="z-30 flex-none bg-brand-800 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand & kiosk station info */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner backdrop-blur">
            <Store className="h-7 w-7 text-emerald-200" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight">Campus Store</h1>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                Kiosk #04
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-100/80">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              Student Activity Center • Level 1 Hub
            </p>
          </div>
        </div>

        {/* Kiosk actions & current clock */}
        <div className="flex items-center gap-5">
          <div className="hidden flex-col border-r border-emerald-700/60 pr-4 text-right md:flex">
            <span className="text-lg font-bold leading-none tracking-tight" data-testid="clock-time">
              {now ? formatTime(now) : "—:—"}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
              {now ? formatDate(now) : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNotify("Staff has been notified — assistance is on the way")}
            title="Call staff assistance"
            className="touch-ripple inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold transition hover:bg-white/20 active:bg-white/25"
          >
            <LifeBuoy className="h-4 w-4 text-emerald-200" aria-hidden="true" />
            <span>Staff Help</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage((lang) => (lang === "EN" ? "FIL" : "EN"))}
            aria-label="Toggle display language (demo)"
            className="touch-ripple flex items-center gap-1.5 rounded-xl border border-white/15 bg-emerald-900/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 hover:bg-emerald-900"
          >
            <span className={language === "EN" ? "text-white" : "text-white/40"}>EN</span>
            <span className="text-white/40">/</span>
            <span className={language === "FIL" ? "text-white" : "text-white/70"}>FIL</span>
          </button>
        </div>
      </div>
    </header>
  );
}
