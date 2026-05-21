"use client";

import { type RecorderState } from "@/hooks/useSpeechmaticsRecorder";

interface Props {
  state: RecorderState;
  elapsed: number;
  processing?: boolean;
  onStart: () => void;
  onStop: () => void;
  size?: number;
}

export default function VoiceOrb({
  state,
  elapsed,
  processing = false,
  onStart,
  onStop,
  size = 168,
}: Props) {
  const isRecording = state === "recording";
  const isBusy = processing || state === "stopping";

  // Countdown ring geometry (ported from MicButton)
  const stroke = 4;
  const ringSize = size + 28;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsed / 60, 1);
  const dashOffset = circumference * (1 - progress);

  const handleClick = () => {
    if (state === "idle" || state === "error") onStart();
    else if (state === "recording") onStop();
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: ringSize, height: ringSize }}
    >
      {/* pulse rings while recording */}
      {isRecording && (
        <>
          <span
            className="orb-pulse-ring absolute rounded-full"
            style={{
              width: size,
              height: size,
              background:
                "radial-gradient(circle, rgba(255,90,60,0.5), transparent 70%)",
            }}
          />
          <span
            className="orb-pulse-ring absolute rounded-full"
            style={{
              width: size,
              height: size,
              animationDelay: "0.9s",
              background:
                "radial-gradient(circle, rgba(124,92,255,0.4), transparent 70%)",
            }}
          />
        </>
      )}

      {/* 60s countdown ring */}
      {isRecording && (
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute"
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={stroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
      )}

      <button
        onClick={handleClick}
        disabled={isBusy}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`group relative overflow-hidden rounded-full shadow-[0_20px_60px_-12px_rgba(124,92,255,0.55)] outline-none transition-transform duration-300 active:scale-95 focus-visible:ring-4 focus-visible:ring-white/60 ${
          isRecording ? "orb-recording" : "orb-breathe"
        }`}
        style={{ width: size, height: size }}
      >
        {/* fluid gradient body */}
        <span
          className="orb-swirl absolute inset-[-15%]"
          style={{
            background:
              "conic-gradient(from 0deg, #ff5a3c, #e0408a, #7c5cff, #5ca8ff, #ff5a3c)",
            filter: "blur(2px)",
          }}
        />
        {/* glossy highlight */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(120% 90% at 30% 25%, rgba(255,255,255,0.65), transparent 55%)",
          }}
        />
        {/* inner glass core */}
        <span className="absolute inset-[18%] rounded-full bg-white/10 backdrop-blur-sm" />

        {/* icon */}
        <span className="relative z-10 flex h-full w-full items-center justify-center text-white drop-shadow">
          {isBusy ? (
            <svg className="h-9 w-9 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-30"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : isRecording ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
              <rect x="6" y="6" width="12" height="12" rx="2.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
              <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
              <path d="M19 11a7 7 0 01-14 0H3a9 9 0 008 8.94V23h2v-3.06A9 9 0 0021 11h-2z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
