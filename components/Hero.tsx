"use client";

import VoiceOrb from "@/components/VoiceOrb";
import LiveTranscript from "@/components/LiveTranscript";
import { type RecorderState } from "@/hooks/useSpeechmaticsRecorder";

interface Props {
  state: RecorderState;
  elapsed: number;
  processing: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

function statusLine(state: RecorderState, processing: boolean, elapsed: number) {
  if (processing || state === "stopping") return "Summarising your note…";
  if (state === "recording") {
    const remaining = Math.max(0, 60 - elapsed);
    return `Listening… ${remaining}s left · tap to stop`;
  }
  if (state === "error") return "Tap to try again";
  return "Tap the orb and start talking";
}

export default function Hero({
  state,
  elapsed,
  processing,
  transcript,
  partialTranscript,
  error,
  onStart,
  onStop,
}: Props) {
  const recording = state === "recording" || state === "stopping";

  return (
    <section className="flex flex-col items-center px-5 pt-14 text-center sm:pt-20">
      <span className="rise-in mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-ink)]/70 glass">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        Voice Journal · AI
      </span>

      <h1
        className="rise-in font-serif text-[2.7rem] leading-[1.02] tracking-tight text-[var(--color-ink)] sm:text-6xl"
        style={{ animationDelay: "0.05s" }}
      >
        Speak it. Capture it.
        <br />
        <span
          style={{
            background: "linear-gradient(100deg, #ff5a3c, #e0408a, #7c5cff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Forget it.
        </span>
      </h1>

      <p
        className="rise-in mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-muted)] sm:text-lg"
        style={{ animationDelay: "0.1s" }}
      >
        Your hands-free journal. Talk for up to a minute — get a clean
        transcript, an AI summary, and a mood, saved privately on your device.
      </p>

      {/* live transcript appears above the orb while recording */}
      <div className="mt-8 min-h-[3.5rem] w-full max-w-md">
        {recording && (
          <LiveTranscript
            transcript={transcript}
            partialTranscript={partialTranscript}
          />
        )}
      </div>

      <div className="mt-2 flex flex-col items-center gap-4">
        <VoiceOrb
          state={state}
          elapsed={elapsed}
          processing={processing}
          onStart={onStart}
          onStop={onStop}
        />
        <p className="text-sm font-medium text-[var(--color-ink)]/75">
          {statusLine(state, processing, elapsed)}
        </p>
      </div>

      {error && (
        <div className="rise-in mt-5 w-full max-w-md rounded-2xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur">
          {error}
        </div>
      )}
    </section>
  );
}
