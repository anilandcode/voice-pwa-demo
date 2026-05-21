"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EntryCard from "@/components/EntryCard";
import { getAllEntries, deleteEntry, type JournalEntry } from "@/lib/db";

export default function EntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const all = await getAllEntries();
    setEntries(all);
    setLoaded(true);
  };

  useEffect(() => {
    load();

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <main className="mx-auto max-w-lg px-5 pb-24 pt-10">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Voice Journal
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-[var(--color-ink)]">
            Your entries
          </h1>
        </div>
        <Link
          href="/"
          className="glass rounded-full px-4 py-2 text-sm text-[var(--color-ink)] transition-transform active:scale-95"
        >
          ← Record
        </Link>
      </div>

      {!loaded ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-24 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-3xl py-16 text-center">
          <span className="text-5xl">🎙️</span>
          <p className="max-w-xs text-sm text-[var(--color-muted)]">
            No entries yet. Tap the orb on the home screen to start.
          </p>
          <Link
            href="/"
            className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-transform active:scale-95"
          >
            Start recording
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
