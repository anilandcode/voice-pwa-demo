import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import SheenBackground from "@/components/SheenBackground";
import BottomTabBar from "@/components/BottomTabBar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voice PWA — Hands-free journal by Anil Pervaiz",
  description:
    "Tap, speak, done. Real-time transcription with Speechmatics + AI summarisation with Kimi K2.6. Installable, works offline for reading.",
  appleWebApp: { capable: true, title: "VoicePWA", statusBarStyle: "default" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/180.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-full font-sans antialiased">
        <SheenBackground />
        <RegisterSW />
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
