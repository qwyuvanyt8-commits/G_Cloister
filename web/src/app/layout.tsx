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

export const metadata: Metadata = {
  title: "G_Cloister — Private file rooms on your Google Drive",
  description:
    "Host a private room on your Google Drive, share a code, and move up to 5 GB of files in real time with your people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("gcl_theme");var d=t?t==="dark":window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.classList.toggle("dark",!!d);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${spaceMono.variable} min-h-full antialiased grain`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
