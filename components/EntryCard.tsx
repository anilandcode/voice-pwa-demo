"use client";

import { useRef } from "react";
import Link from "next/link";
import type { JournalEntry } from "@/lib/db";

const MOOD: Record<JournalEntry["mood"], { color: string; emoji: string }> = {
  neutral: { color: "#8a8a96", emoji: "😐" },
  positive: { color: "#22c55e", emoji: "😊" },
  reflective: { color: "#2f6bff", emoji: "🪞" },
  urgent: { color: "#ef4444", emoji: "🔥" },
};

interface Props {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const touchStartX = useRef<number | null>(null);
  const mood = MOOD[entry.mood] ?? MOOD.neutral;

  const date = new Date(entry.recordedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 90) {
      if (confirm("Delete this note?")) onDelete(entry.id);
    }
    touchStartX.current = null;
  };

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="rise-in card block rounded-3xl p-4 transition-transform active:scale-[0.99]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
          style={{ background: `${mood.color}1a` }}
        >
          {mood.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
              {date}
            </p>
            <span className="font-mono text-[11px] text-[var(--color-muted)]">
              {entry.audioDurationSec}s
            </span>
          </div>
          <p className="mt-1 text-[15px] font-medium leading-snug text-[var(--color-ink)] line-clamp-2">
            {entry.summary}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
