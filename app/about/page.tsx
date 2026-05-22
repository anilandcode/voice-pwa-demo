import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-10">
      <p className="mb-2 text-sm font-medium text-[var(--color-muted)]">About</p>
      <h1 className="mb-7 text-[2.4rem] font-extrabold tracking-tight text-[var(--color-ink)]">
        Voice PWA
      </h1>

      <div className="card space-y-4 rounded-3xl p-6 text-[15px] leading-relaxed text-[var(--color-ink)]/80">
        <p>
          Built by{" "}
          <a
            href="https://anilpervaiz.com"
            className="font-medium text-[var(--color-accent)] underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anil Pervaiz
          </a>
          . Real-time transcription via{" "}
          <span className="font-medium text-[var(--color-ink)]">Speechmatics</span> —
          words appear as you speak, with sub-300ms partial transcripts. AI
          summary and tagging via{" "}
          <span className="font-medium text-[var(--color-ink)]">
            Kimi K2.6 on Vultr Inference
          </span>
          . Storage is local — your voice notes never leave your device.
        </p>
        <p>
          Installable as a Progressive Web App: tap &ldquo;Add to Home
          Screen&rdquo; in Safari on iPhone for one-tap journaling. The entries
          page works fully offline.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="https://anilpervaiz.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-8px_rgba(47,107,255,0.6)] transition-transform active:scale-95"
        >
          Want a custom voice AI for your team? Brief me
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          ← Back to app
        </Link>
      </div>
    </main>
  );
}
