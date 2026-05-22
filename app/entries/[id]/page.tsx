"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEntry, deleteEntry, type JournalEntry } from "@/lib/db";

const MOOD: Record<JournalEntry["mood"], { color: string; emoji: string; label: string }> = {
  neutral: { color: "#8a8a96", emoji: "😐", label: "Neutral" },
  positive: { color: "#22c55e", emoji: "😊", label: "Positive" },
  reflective: { color: "#2f6bff", emoji: "🪞", label: "Reflective" },
  urgent: { color: "#ef4444", emoji: "🔥", label: "Urgent" },
};

function MetaRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="w-24 shrink-0 text-sm text-[var(--color-muted)]">
        <span className="mr-1.5">{icon}</span>
        {label}
      </span>
      <div className="flex-1 text-sm text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

export default function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getEntry(id).then((e) => {
      setEntry(e ?? null);
      setLoaded(true);
    });
  }, [id]);

  if (loaded && !entry) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="text-4xl">🔍</span>
        <p className="text-[var(--color-muted)]">This note no longer exists.</p>
        <button
          onClick={() => router.push("/entries")}
          className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Back to entries
        </button>
      </main>
    );
  }

  const mood = entry ? MOOD[entry.mood] ?? MOOD.neutral : MOOD.neutral;
  const created = entry
    ? new Date(entry.recordedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-6">
      {/* top bar */}
      <header className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="card flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {entry && (
          <button
            onClick={async () => {
              if (confirm("Delete this note?")) {
                await deleteEntry(entry.id);
                router.push("/entries");
              }
            }}
            aria-label="Delete"
            className="card flex h-11 w-11 items-center justify-center rounded-full text-red-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </header>

      {!entry ? (
        <div className="mt-8 space-y-4">
          <div className="card h-28 animate-pulse rounded-3xl" />
          <div className="card h-48 animate-pulse rounded-3xl" />
        </div>
      ) : (
        <>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Created {created}
          </p>
          <h1 className="mt-2 flex items-start gap-2 text-[1.7rem] font-extrabold leading-tight tracking-tight text-[var(--color-ink)]">
            <span className="text-2xl">{mood.emoji}</span>
            <span>{entry.summary}</span>
          </h1>

          {/* metadata */}
          <div className="mt-5 card rounded-3xl px-5 py-2">
            <MetaRow icon="🗓" label="Recorded">{created}</MetaRow>
            <div className="border-t border-[var(--color-border)]" />
            <MetaRow icon="⏱" label="Duration">{entry.audioDurationSec}s</MetaRow>
            <div className="border-t border-[var(--color-border)]" />
            <MetaRow icon="🎭" label="Mood">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: `${mood.color}1a`, color: mood.color }}
              >
                {mood.label}
              </span>
            </MetaRow>
            <div className="border-t border-[var(--color-border)]" />
            <MetaRow icon="🏷" label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </MetaRow>
          </div>

          {/* transcript */}
          <h2 className="mt-8 text-lg font-bold tracking-tight text-[var(--color-ink)]">
            Transcript
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-ink)]/80">
            {entry.transcript || "No speech was captured for this note."}
          </p>

          {entry.status === "pending" && (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Summary is pending — it will refresh when you&apos;re back online.
            </p>
          )}
        </>
      )}
    </main>
  );
}
