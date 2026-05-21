"use client";

import { useState, useRef } from "react";
import type { JournalEntry } from "@/lib/db";

const MOOD_COLORS: Record<JournalEntry["mood"], string> = {
  neutral: "#6b7280",
  positive: "#22c55e",
  reflective: "#3b82f6",
  urgent: "#ef4444",
};

interface Props {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const date = new Date(entry.recordedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 80) setConfirming(true);
    touchStartX.current = null;
  };

  return (
    <div
      className="rise-in glass relative overflow-hidden rounded-3xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ background: MOOD_COLORS[entry.mood] }}
      />

      <div className="py-4 pl-5 pr-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
              {date}
            </p>
            <p className="font-serif text-[17px] leading-snug text-[var(--color-ink)] line-clamp-2">
              {entry.summary}
            </p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded-full px-3 py-1 text-xs text-[var(--color-muted)] transition-colors hover:bg-white/60"
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs text-[var(--color-ink)]/70 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {expanded && (
          <div className="mt-3 border-t border-white/50 pt-3 text-[13px] leading-relaxed text-[var(--color-muted)]">
            {entry.transcript}
          </div>
        )}
      </div>

      {confirming && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/85 backdrop-blur-md">
          <p className="text-sm font-medium text-[var(--color-ink)]">Delete this entry?</p>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded-xl bg-red-500 px-3 py-1.5 text-sm text-white"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-xl bg-black/10 px-3 py-1.5 text-sm text-[var(--color-ink)]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
