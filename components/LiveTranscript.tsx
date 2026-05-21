"use client";

interface Props {
  transcript: string;
  partialTranscript: string;
}

export default function LiveTranscript({ transcript, partialTranscript }: Props) {
  if (!transcript && !partialTranscript) {
    return (
      <div className="glass rounded-2xl px-4 py-3 text-sm text-[var(--color-muted)]">
        …
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl px-4 py-3 text-left text-[15px] leading-relaxed text-[var(--color-ink)]">
      <span className="word-in">{transcript}</span>
      {partialTranscript && (
        <span className="italic text-[var(--color-muted)]"> {partialTranscript}</span>
      )}
    </div>
  );
}
