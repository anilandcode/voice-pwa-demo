"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "1.8"}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Focused recording screen has its own controls — no tab bar.
  if (pathname === "/record") return null;

  const isHome = pathname === "/";
  const isEntries = pathname.startsWith("/entries");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass flex items-center gap-2 rounded-full px-3 py-2.5">
        <Link
          href="/"
          aria-label="Home"
          className={`flex h-11 w-14 items-center justify-center rounded-full transition-colors ${
            isHome ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
          }`}
        >
          <HomeIcon active={isHome} />
        </Link>

        {/* center record orb */}
        <button
          onClick={() => router.push("/record")}
          aria-label="Record a note"
          className="orb-breathe relative -my-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shadow-[0_12px_30px_-6px_rgba(47,107,255,0.6)] transition-transform active:scale-95"
        >
          <span
            className="orb-swirl absolute inset-[-15%]"
            style={{
              background:
                "conic-gradient(from 0deg, #2f6bff, #5b8cff, #6ad0ff, #2f6bff)",
            }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(120% 90% at 30% 25%, rgba(255,255,255,0.7), transparent 55%)",
            }}
          />
          <svg viewBox="0 0 24 24" fill="white" className="relative z-10 h-7 w-7 drop-shadow">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
            <path d="M19 11a7 7 0 01-14 0H3a9 9 0 008 8.94V23h2v-3.06A9 9 0 0021 11h-2z" />
          </svg>
        </button>

        <Link
          href="/entries"
          aria-label="Entries"
          className={`flex h-11 w-14 items-center justify-center rounded-full transition-colors ${
            isEntries ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
          }`}
        >
          <ListIcon active={isEntries} />
        </Link>
      </div>
    </nav>
  );
}
