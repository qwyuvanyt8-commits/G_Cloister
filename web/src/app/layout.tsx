import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gcloister.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "G_Cloister — Private file rooms on your Google Drive",
  description:
    "Host a private room on your Google Drive, share a code, and move up to 5 GB of files in real time with your people.",
  applicationName: "G_Cloister",
  authors: [{ name: "G_Cloister", url: "https://gcloister.vercel.app/about" }],
  creator: "G_Cloister",
  publisher: "G_Cloister",
  category: "productivity",
  keywords: [
    "file sharing",
    "real time",
    "google drive",
    "private rooms",
    "open source",
    "self hosted",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "G_Cloister",
    title: "G_Cloister — Private file rooms on your Google Drive",
    description:
      "Open source file rooms that live in the host's own Google Drive. Password-locked, real time, MIT licensed.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "G_Cloister" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "G_Cloister — Private file rooms on your Google Drive",
    description:
      "Open source file rooms that live in the host's own Google Drive. Password-locked, real time, MIT licensed.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${archivo.variable} ${spaceMono.variable} min-h-full antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
