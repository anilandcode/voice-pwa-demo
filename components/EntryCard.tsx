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
      className="relative overflow-hidden rounded-xl bg-white shadow-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ background: MOOD_COLORS[entry.mood] }}
      />

      <div className="pl-4 pr-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-muted)] mb-1">{date}</p>
            <p className="text-sm font-medium leading-snug line-clamp-2">{entry.summary}</p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 text-[var(--color-muted)] text-xs px-2 py-1 rounded-lg hover:bg-neutral-100"
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {expanded && (
          <div className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-600 leading-relaxed">
            {entry.transcript}
          </div>
        )}
      </div>

      {confirming && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/95 backdrop-blur-sm">
          <p className="text-sm font-medium text-neutral-700">Delete this entry?</p>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
