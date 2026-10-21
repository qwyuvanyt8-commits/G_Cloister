import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — G_Cloister",
  description:
    "What G_Cloister stores, where it stores it, and what it never touches.",
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "The short version",
    p: [
      "G_Cloister stores the files you upload inside your own Google Drive, not on our servers. We keep only the small amount of metadata needed to run a room: your Google account ID and email, the room you created, the room membership, file names, and a timestamp for each change.",
      "We never read, index, scan or sell the contents of the files inside your Drive folder. We cannot — the OAuth scope we request only grants access to files this app creates.",
    ],
  },
  {
    h: "What we collect",
    p: [
      "Account: your Google account ID, email address and display name, read once at sign-in through Google's OAuth service. Sign-in is handled by Google; we never see your Google password.",
      "OAuth tokens: the access and refresh tokens Google issues for your Drive. They are encrypted at rest with AES-256-GCM before they are written to our database, and a key held in server environment variables encrypts them. Decryption happens in memory only.",
      "Room data: room IDs, room passwords (stored only as a bcrypt hash), the list of members in a room, the names and sizes of files uploaded to that room, and timestamps of uploads, renames and deletions.",
      "Technical data: nothing beyond what is strictly needed to serve the app. We do not run third-party analytics, advertising or tracking scripts.",
    ],
  },
  {
    h: "Where data lives",
    p: [
      "Files: inside a dedicated folder in the host's Google Drive. If the host removes a room, that folder and its files are deleted from their Drive.",
      "Metadata: in a managed LibSQL (Turso) database, and in the case of a locally hosted instance, a SQLite file on the host's own disk.",
      "Session state: a signed, HTTP-only cookie in your browser. It contains a session identifier only — no file contents, no Drive tokens.",
    ],
  },
  {
    h: "Who can see what",
    p: [
      "Only people who know a room's ID and password can enter that room, and they see only the files inside it. Room passwords are never stored or transmitted in plaintext.",
      "Preview links to individual files expire after 15 minutes and their temporary Drive permission is revoked automatically when they expire.",
      "The host of a room can remove members, and can purge the room's folder from their Drive. Doing so removes the files for everyone in that room.",
    ],
  },
  {
    h: "Retention and deletion",
    p: [
      "Your account and room metadata are kept for as long as the service is available. Deleting a room removes its metadata and its Drive folder. A signed-in session lasts up to 30 days before it has to be renewed by signing in again.",
      "To request deletion of your account data, email us at the address on the Sign in page. We will remove the associated rows from the database within 30 days.",
    ],
  },
  {
    h: "Sharing with third parties",
    p: [
      "We share data with exactly three service providers, each limited to the minimum needed to run the app: Google (for OAuth sign-in and Drive storage), Vercel (which serves this website), and Render (which runs the API and database). None of them are used for advertising or profiling.",
      "We do not sell personal information, and we do not share it with data brokers.",
    ],
  },
  {
    h: "Your choices",
    p: [
      "You can revoke G_Cloister's access to your Drive at any time from your Google account security settings. After you do that, uploads and previews stop working for rooms you host.",
      "You can leave a room at any time. You can ask us to delete your account data entirely.",
    ],
  },
  {
    h: "Contact",
    p: [
      "Questions about this policy can be sent to the support email listed on the sign-in screen. We aim to answer within a few business days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
          Legal
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,46px)] font-black leading-[0.95] tracking-[-0.04em]">
          Privacy Policy
        </h1>
        <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-gc-faint">
          G_Cloister · last updated 21 October 2026
        </p>

        <div className="mt-10 space-y-9">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-[19px] font-bold tracking-[-0.01em] text-gc-ink">{s.h}</h2>
              <div className="mt-3 space-y-3">
                {s.p.map((para) => (
                  <p key={para} className="text-[15px] leading-relaxed text-gc-muted">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
          <Link
            href="/"
            className="rounded-lg bg-gc-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-gc-cobalt-dark"
          >
            Back to G_Cloister
          </Link>
          <Link href="/terms" className="text-sm text-gc-muted underline-offset-4 hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
