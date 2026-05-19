"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MicButton from "@/components/MicButton";
import LiveTranscript from "@/components/LiveTranscript";
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
    <main className="mx-auto max-w-lg px-4 pb-24 pt-10">
      <InstallBanner />

      <section className="mt-8 mb-10">
        <p className="text-xs uppercase tracking-widest font-mono text-[var(--color-muted)] mb-2">
          VOICE PWA
        </p>
        <h1 className="text-3xl font-bold tracking-tight leading-tight">
          Speak it. Capture it.{" "}
          <span style={{ color: "var(--color-accent)" }}>Forget it.</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
          Your hands-free journal.
        </p>
      </section>

      <section className="flex flex-col items-center gap-8 mb-10">
        {(recorder.state === "recording" || recorder.state === "stopping") && (
          <LiveTranscript
            transcript={recorder.transcript}
            partialTranscript={recorder.partialTranscript}
          />
        )}

        <MicButton
          state={processing ? "stopping" : recorder.state}
          elapsed={recorder.elapsed}
          onStart={recorder.start}
          onStop={recorder.stop}
        />

        {recorder.error && (
          <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {recorder.error}
          </div>
        )}

        {processing && (
          <p className="text-sm animate-pulse" style={{ color: "var(--color-muted)" }}>
            Summarising your note…
          </p>
        )}

        {recorder.state === "idle" && !processing && (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Tap to start recording (up to 60s)
          </p>
        )}
      </section>

      {latestEntry && (
        <section className="mb-8">
          <p
            className="text-xs uppercase tracking-widest font-mono mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            LATEST ENTRY
          </p>
          <EntryCard
            entry={latestEntry}
            onDelete={async (id) => {
              await deleteEntry(id);
              const entries = await getAllEntries();
              setLatestEntry(entries[0] ?? null);
            }}
          />
        </section>
      )}

      <div className="text-center">
        <Link
          href="/entries"
          className="inline-block rounded-full border-2 px-6 py-2.5 text-sm font-medium transition-colors"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
          }}
        >
          View all entries
        </Link>
      </div>

      <nav className="mt-8 flex justify-center gap-6 text-xs" style={{ color: "var(--color-muted)" }}>
        <Link href="/about" className="underline underline-offset-2">About</Link>
      </nav>
    </main>
  );
}
