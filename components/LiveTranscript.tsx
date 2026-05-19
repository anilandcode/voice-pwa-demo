"use client";

interface Props {
  transcript: string;
  partialTranscript: string;
}

export default function LiveTranscript({ transcript, partialTranscript }: Props) {
  if (!transcript && !partialTranscript) return null;

  return (
    <div className="min-h-[4rem] rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 text-sm leading-relaxed text-neutral-800 shadow-sm">
      <span className="word-in">{transcript}</span>
      {partialTranscript && (
        <span className="italic text-neutral-400"> {partialTranscript}</span>
      )}
    </div>
  );
}
