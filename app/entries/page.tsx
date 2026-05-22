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
    <main className="mx-auto max-w-md px-5 pb-32 pt-8">
      <div className="mb-6">
        <p className="mb-1 text-sm font-medium text-[var(--color-muted)]">
          {entries.length} {entries.length === 1 ? "note" : "notes"}
        </p>
        <h1 className="text-[2.1rem] font-extrabold tracking-tight text-[var(--color-ink)]">
          Your notes
        </h1>
      </div>

      {!loaded ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 rounded-3xl py-16 text-center">
          <span className="text-5xl">🎙️</span>
          <p className="max-w-xs text-sm text-[var(--color-muted)]">
            No notes yet. Tap the orb below to capture your first thought.
          </p>
          <Link
            href="/record"
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
