"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import FeatureBento from "@/components/FeatureBento";
import InstallBanner from "@/components/InstallBanner";
import EntryCard from "@/components/EntryCard";
import { useSpeechmaticsRecorder } from "@/hooks/useSpeechmaticsRecorder";
import { saveEntry, getAllEntries, deleteEntry, type JournalEntry } from "@/lib/db";

export default function Home() {
  const recorder = useSpeechmaticsRecorder();
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);
  const [processing, setProcessing] = useState(false);
  const [doneFired, setDoneFired] = useState(false);

  const handleDone = useCallback(async () => {
    const { transcript, elapsed } = recorder;

    setProcessing(true);
    const recordedAt = new Date().toISOString();

    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript || "",
          audioDurationSec: elapsed,
          recordedAt,
        }),
      });

      const data = (await res.json()) as {
        summary: string;
        tags: string[];
        mood: JournalEntry["mood"];
      };

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        transcript: transcript || "",
        summary: data.summary,
        tags: Array.isArray(data.tags) ? data.tags : [],
        mood: data.mood ?? "neutral",
        audioDurationSec: elapsed,
        recordedAt,
        status: "complete",
        createdAt: Date.now(),
      };

      await saveEntry(entry);
      setLatestEntry(entry);
    } catch {
      const pendingEntry: JournalEntry = {
        id: crypto.randomUUID(),
        transcript: transcript || "",
        summary: "Summary pending (offline)",
        tags: ["pending"],
        mood: "neutral",
        audioDurationSec: elapsed,
        recordedAt,
        status: "pending",
        createdAt: Date.now(),
      };
      await saveEntry(pendingEntry);
      setLatestEntry(pendingEntry);

      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (
          reg as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }
        ).sync.register("pending-entries");
      }
    } finally {
      setProcessing(false);
      recorder.reset();
      setDoneFired(false);
    }
  }, [recorder]);

  useEffect(() => {
    if (recorder.state === "done" && !doneFired && !processing) {
      setDoneFired(true);
      handleDone();
    }
  }, [recorder.state, doneFired, processing, handleDone]);

  useEffect(() => {
    getAllEntries().then((entries) => {
      if (entries.length > 0) setLatestEntry(entries[0]);
    });
  }, []);

  return (
    <main className="relative mx-auto max-w-2xl px-0 pb-16">
      <div className="px-5 pt-5">
        <InstallBanner />
      </div>

      <Hero
        state={recorder.state}
        elapsed={recorder.elapsed}
        processing={processing}
        transcript={recorder.transcript}
        partialTranscript={recorder.partialTranscript}
        error={recorder.error}
        onStart={recorder.start}
        onStop={recorder.stop}
      />

      {latestEntry && (
        <section className="mt-12 px-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Latest entry
          </p>
          <EntryCard
            entry={latestEntry}
            onDelete={async (id) => {
              await deleteEntry(id);
              const entries = await getAllEntries();
              setLatestEntry(entries[0] ?? null);
            }}
          />
          <div className="mt-5 text-center">
            <Link
              href="/entries"
              className="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] glass transition-transform active:scale-95"
            >
              View all entries
            </Link>
          </div>
        </section>
      )}

      <FeatureBento />

      <footer className="px-5 pb-10 text-center">
        <p className="font-serif text-2xl tracking-tight text-[var(--color-ink)]">
          Ready when you are.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          Built by Anil Pervaiz · Real-time ASR by Speechmatics · AI by Kimi K2.6
        </p>
        <nav className="mt-5 flex justify-center gap-6 text-sm text-[var(--color-ink)]/70">
          <Link href="/entries" className="underline-offset-4 hover:underline">
            Entries
          </Link>
          <Link href="/about" className="underline-offset-4 hover:underline">
            About
          </Link>
        </nav>
      </footer>
    </main>
  );
}
