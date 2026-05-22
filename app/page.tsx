"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InstallBanner from "@/components/InstallBanner";
import EntryCard from "@/components/EntryCard";
import { getAllEntries, deleteEntry, type JournalEntry } from "@/lib/db";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setEntries(await getAllEntries());
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const recent = entries.slice(0, 3);

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-8">
      {/* header */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">🎙️</span>
        <p className="text-sm font-medium text-[var(--color-muted)]">
          {greeting()} — talk it out.
        </p>
      </div>
      <h1 className="mb-6 text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-[var(--color-ink)]">
        Speak your mind,
        <br />
        keep the gist.
      </h1>

      <InstallBanner />

      {/* primary CTA card → record */}
      <Link
        href="/record"
        className="rise-in mt-5 flex items-center gap-4 rounded-3xl p-5 text-white shadow-[0_14px_40px_-12px_rgba(47,107,255,0.7)] transition-transform active:scale-[0.99]"
        style={{ background: "linear-gradient(120deg, #2f6bff, #5b8cff)" }}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
            <path d="M19 11a7 7 0 01-14 0H3a9 9 0 008 8.94V23h2v-3.06A9 9 0 0021 11h-2z" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="text-[17px] font-semibold">New voice note</p>
          <p className="text-sm text-white/80">Tap to record up to 60 seconds</p>
        </div>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* recent entries */}
      <div className="mt-9 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[var(--color-ink)]">
          Recent notes
        </h2>
        {entries.length > 0 && (
          <Link
            href="/entries"
            className="text-sm font-medium text-[var(--color-accent)]"
          >
            See all
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {!loaded ? (
          [1, 2].map((i) => (
            <div key={i} className="card h-24 animate-pulse rounded-3xl" />
          ))
        ) : recent.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 rounded-3xl py-12 text-center">
            <span className="text-4xl">📝</span>
            <p className="max-w-[16rem] text-sm text-[var(--color-muted)]">
              No notes yet. Tap{" "}
              <span className="font-medium text-[var(--color-ink)]">
                New voice note
              </span>{" "}
              to capture your first thought.
            </p>
          </div>
        ) : (
          recent.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={async (id) => {
                await deleteEntry(id);
                load();
              }}
            />
          ))
        )}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--color-muted)]">
        Real-time ASR by Speechmatics · AI by Kimi K2.6 ·{" "}
        <Link href="/about" className="underline underline-offset-2">
          About
        </Link>
      </p>
    </main>
  );
}
