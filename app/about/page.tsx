import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-10">
      <p className="text-xs uppercase tracking-widest font-mono text-[var(--color-muted)] mb-2">
        ABOUT
      </p>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Voice PWA</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm text-sm leading-relaxed text-neutral-700 space-y-4">
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
          <span className="font-medium">Speechmatics</span> — words appear as
          you speak, with sub-300ms partial transcripts. AI summary and tagging
          via <span className="font-medium">Kimi K2</span>. Storage is
          local — your voice notes never leave your device.
        </p>
        <p>
          Installable as a Progressive Web App: tap "Add to Home Screen" in
          Safari on iPhone for one-tap journaling. The entries page works fully
          offline.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="https://anilpervaiz.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white"
        >
          Want a custom voice AI for your team? Brief me
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-[var(--color-muted)] underline underline-offset-2">
          ← Back to app
        </Link>
      </div>
    </main>
  );
}
