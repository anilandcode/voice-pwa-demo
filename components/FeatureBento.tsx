const FEATURES = [
  {
    icon: "🎙️",
    title: "Real-time transcription",
    body: "Words appear as you speak — sub-300ms partials powered by Speechmatics.",
    span: "sm:col-span-2",
    tint: "linear-gradient(135deg, rgba(120,180,255,0.35), rgba(124,92,255,0.18))",
  },
  {
    icon: "✨",
    title: "AI summary & mood",
    body: "Kimi K2.6 distills each note into a 2-line summary, 3 tags, and a mood.",
    span: "",
    tint: "linear-gradient(135deg, rgba(255,90,60,0.3), rgba(224,64,138,0.18))",
  },
  {
    icon: "🔒",
    title: "Private by default",
    body: "Everything lives in your browser. Notes never leave your device.",
    span: "",
    tint: "linear-gradient(135deg, rgba(124,92,255,0.3), rgba(120,180,255,0.16))",
  },
  {
    icon: "📲",
    title: "Installable PWA",
    body: "Add to your home screen. Reads work offline, opens in one tap.",
    span: "sm:col-span-2",
    tint: "linear-gradient(135deg, rgba(255,150,120,0.3), rgba(255,90,60,0.16))",
  },
];

export default function FeatureBento() {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Why it&apos;s different
        </span>
        <h2 className="mt-2 font-serif text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          A journal that listens, thinks, and forgets nothing.
        </h2>
      </div>

      <div className="mx-auto mt-9 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`glass rounded-3xl p-6 ${f.span}`}
            style={{ backgroundImage: f.tint }}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-xl shadow-sm">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {f.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
