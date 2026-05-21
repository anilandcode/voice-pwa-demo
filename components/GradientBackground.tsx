/**
 * Fixed, full-viewport animated mesh gradient + soft horizon silhouette.
 * Pure CSS/SVG — no JS cost, no image dependency.
 * Cool sky-blue → lavender → soft peach near a bottom horizon.
 */
export default function GradientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #bcd4f5 0%, #cdd1f3 38%, #e7d6ed 70%, #f6e3da 100%)" }}
    >
      {/* drifting mesh blobs */}
      <div className="mesh-layer absolute inset-0">
        <div
          className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full blur-3xl opacity-70"
          style={{ background: "radial-gradient(circle, rgba(124,92,255,0.55), transparent 60%)" }}
        />
        <div
          className="absolute top-[5%] right-[-15%] h-[60vh] w-[60vh] rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(circle, rgba(120,180,255,0.6), transparent 60%)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[20%] h-[55vh] w-[55vh] rounded-full blur-3xl opacity-55"
          style={{ background: "radial-gradient(circle, rgba(255,150,120,0.5), transparent 60%)" }}
        />
        <div
          className="absolute bottom-[-5%] right-[10%] h-[45vh] w-[45vh] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(224,64,138,0.4), transparent 60%)" }}
        />
      </div>

      {/* soft rolling-hill horizon */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "28vh" }}
      >
        <path
          fill="rgba(255,255,255,0.35)"
          d="M0,224 C240,160 480,288 720,256 C960,224 1200,128 1440,192 L1440,320 L0,320 Z"
        />
        <path
          fill="rgba(255,255,255,0.22)"
          d="M0,272 C320,224 560,320 820,288 C1080,256 1280,208 1440,256 L1440,320 L0,320 Z"
        />
      </svg>

      {/* subtle top sheen */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent 30%)" }}
      />
    </div>
  );
}
