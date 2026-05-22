"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VoiceOrb from "@/components/VoiceOrb";
import LiveTranscript from "@/components/LiveTranscript";
import { useSpeechmaticsRecorder } from "@/hooks/useSpeechmaticsRecorder";
import { saveEntry, type JournalEntry } from "@/lib/db";

function statusLine(
  state: string,
  processing: boolean,
  elapsed: number
): string {
  if (processing || state === "stopping") return "Summarising your note…";
  if (state === "recording")
    return `Listening… ${Math.max(0, 60 - elapsed)}s left · tap to stop`;
  if (state === "error") return "Tap the orb to try again";
  return "Tap the orb and start talking";
}

export default function RecordPage() {
  const router = useRouter();
  const recorder = useSpeechmaticsRecorder();
  const [processing, setProcessing] = useState(false);
  const [doneFired, setDoneFired] = useState(false);

  const handleDone = useCallback(async () => {
    const { transcript, elapsed } = recorder;

    if (!transcript.trim()) {
      recorder.reset();
      setDoneFired(false);
      return;
    }

    setProcessing(true);
    const recordedAt = new Date().toISOString();
    const id = crypto.randomUUID();

    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
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
        id,
        transcript,
        summary: data.summary,
        tags: Array.isArray(data.tags) ? data.tags : [],
        mood: data.mood ?? "neutral",
        audioDurationSec: elapsed,
        recordedAt,
        status: "complete",
        createdAt: Date.now(),
      };
      await saveEntry(entry);
    } catch {
      const pendingEntry: JournalEntry = {
        id,
        transcript,
        summary: "Summary pending (offline)",
        tags: ["pending"],
        mood: "neutral",
        audioDurationSec: elapsed,
        recordedAt,
        status: "pending",
        createdAt: Date.now(),
      };
      await saveEntry(pendingEntry);

      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (
          reg as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }
        ).sync.register("pending-entries");
      }
    } finally {
      recorder.reset();
      router.push(`/entries/${id}`);
    }
  }, [recorder, router]);

  useEffect(() => {
    if (recorder.state === "done" && !doneFired && !processing) {
      setDoneFired(true);
      handleDone();
    }
  }, [recorder.state, doneFired, processing, handleDone]);

  const recording = recorder.state === "recording" || recorder.state === "stopping";

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5">
      <header className="flex items-center justify-between pt-6">
        <button
          onClick={() => router.push("/")}
          aria-label="Close"
          className="card flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          New note
        </p>
        <span className="h-11 w-11" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-16">
        <div className="min-h-[3.5rem] w-full">
          {recording && (
            <LiveTranscript
              transcript={recorder.transcript}
              partialTranscript={recorder.partialTranscript}
            />
          )}
        </div>

        <VoiceOrb
          state={recorder.state}
          elapsed={recorder.elapsed}
          processing={processing}
          onStart={recorder.start}
          onStop={recorder.stop}
          size={200}
        />

        <p className="text-center text-[15px] font-medium text-[var(--color-ink)]/75">
          {statusLine(recorder.state, processing, recorder.elapsed)}
        </p>

        {recorder.error && (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {recorder.error}
          </div>
        )}
      </div>
    </main>
  );
}
