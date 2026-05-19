import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voice PWA — Hands-free journal",
    short_name: "VoicePWA",
    description:
      "Tap, speak, done. Real-time transcription with Speechmatics + AI summarisation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f1f1",
    theme_color: "#ff5a3c",
    icons: [
      { src: "/icons/192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
