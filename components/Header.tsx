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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-5 sm:px-6 sm:py-3.5">
        {/* Brand & kiosk station info */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white shadow-inner backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl">
            <Store className="h-6 w-6 text-emerald-200 sm:h-7 sm:w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <h1 className="truncate text-base font-bold tracking-tight sm:text-xl">Campus Store</h1>
              <span className="hidden min-[360px]:inline flex-none rounded-full border border-emerald-300/30 bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200 sm:px-2 sm:text-xs">
                Kiosk #04
              </span>
            </div>
            {/* Location is too long for phones; the kiosk badge above keeps
                the station identity visible on small screens. */}
            <p className="mt-0.5 hidden items-center gap-1.5 text-xs font-medium text-emerald-100/80 sm:flex">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              Student Activity Center • Level 1 Hub
            </p>
          </div>
        </div>

        {/* Kiosk actions & current clock */}
        <div className="flex flex-none items-center gap-2 sm:gap-5">
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
            aria-label="Call staff assistance"
            className="touch-ripple inline-flex flex-none items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-sm font-semibold transition hover:bg-white/20 active:bg-white/25 sm:px-3.5"
          >
            <LifeBuoy className="h-4 w-4 text-emerald-200" aria-hidden="true" />
            <span className="hidden sm:inline">Staff Help</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage((lang) => (lang === "EN" ? "FIL" : "EN"))}
            aria-label="Toggle display language (demo)"
            className="touch-ripple flex flex-none items-center gap-1.5 rounded-xl border border-white/15 bg-emerald-900/60 px-1.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 hover:bg-emerald-900 sm:px-3"
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
