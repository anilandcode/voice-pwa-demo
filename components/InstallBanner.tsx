"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div className="rise-in card mt-5 flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="text-2xl">📲</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-[var(--color-ink)]">Add to Home Screen</p>
        <p className="text-[var(--color-muted)]">One-tap journaling, works offline</p>
      </div>
      <button
        onClick={async () => {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === "accepted") setDismissed(true);
          setPrompt(null);
        }}
        className="rounded-xl bg-[var(--color-accent)] px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-transform active:scale-95"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-lg leading-none text-[var(--color-muted)]"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
