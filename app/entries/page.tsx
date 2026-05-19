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
    <main className="mx-auto max-w-lg px-4 pb-24 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-[var(--color-muted)] mb-1">
            VOICE PWA
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm"
        >
          ← Record
        </Link>
      </div>

      {!loaded ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-5xl">🎙️</span>
          <p className="text-[var(--color-muted)] text-sm">
            No entries yet. Tap the mic on the home screen to start.
          </p>
          <Link
            href="/"
            className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white"
          >
            Start recording
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
