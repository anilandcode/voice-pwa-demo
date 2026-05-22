/**
 * Near-white background with a faint iridescent corner sheen.
 * Mostly white — just a whisper of color top-left + bottom, matching the
 * clean notes/AI mockups. Pure CSS, fixed behind content.
 */
export default function SheenBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="absolute -left-[10%] -top-[10%] h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(120,200,180,0.18), transparent 65%)",
        }}
      />
      <div
        className="absolute -right-[10%] top-[8%] h-[45vh] w-[45vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(120,150,255,0.16), transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-[-12%] left-1/3 h-[50vh] w-[50vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(150,200,255,0.14), transparent 65%)",
        }}
      />
    </div>
  );
}
