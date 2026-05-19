"use client";

import { type RecorderState } from "@/hooks/useSpeechmaticsRecorder";

interface Props {
  state: RecorderState;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MicButton({ state, elapsed, onStart, onStop }: Props) {
  const progress = Math.min(elapsed / 60, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isRecording = state === "recording";
  const isProcessing = state === "stopping" || state === "done";

  const handleClick = () => {
    if (state === "idle" || state === "error") onStart();
    else if (state === "recording") onStop();
  };

  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <span
          className="pulse-ring absolute inset-0 rounded-full"
          style={{ background: "var(--color-accent)", opacity: 0.3 }}
        />
      )}

      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        className="absolute"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {isRecording && (
          <>
            <circle cx="56" cy="56" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle
              cx="56"
              cy="56"
              r={RADIUS}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />
          </>
        )}
      </svg>

      <button
        onClick={handleClick}
        disabled={isProcessing && state !== "done"}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: "var(--color-accent)",
        }}
      >
        {state === "stopping" ? (
          <svg
            className="h-8 w-8 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : isRecording ? (
          <svg viewBox="0 0 24 24" fill="white" className="h-9 w-9">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white" className="h-9 w-9">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
            <path d="M19 11a7 7 0 01-14 0H3a9 9 0 0018 0h-2z" />
            <line x1="12" y1="20" x2="12" y2="23" stroke="white" strokeWidth="2" />
            <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" />
          </svg>
        )}
      </button>

      {isRecording && (
        <span
          className="absolute -bottom-8 text-sm font-mono font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")} / 1:00
        </span>
      )}
    </div>
  );
}
