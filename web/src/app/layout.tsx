import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "G_Cloister — Private file rooms on your Google Drive",
  description:
    "Host a private room on your Google Drive, share a code, and move up to 5 GB of files in real time with your people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased grain`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
