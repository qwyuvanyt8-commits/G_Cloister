import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — G_Cloister",
  description: "The rules for using G_Cloister, a private file room on your Google Drive.",
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "Acceptance",
    p: [
      "By creating an account or using a room on G_Cloister you agree to these terms. If you do not agree, do not use the service.",
    ],
  },
  {
    h: "What G_Cloister is",
    p: [
      "G_Cloister is a file-sharing tool. It lets a host open a room backed by a folder in their own Google Drive, and lets people who know the room ID and password upload and download files in that room in real time.",
      "The software is provided as-is. It is a small project maintained by one person, not a commercial product with a support desk.",
    ],
  },
  {
    h: "Your account and your Drive",
    p: [
      "You sign in with Google. We request the `drive.file` scope, which lets the app see only the files and folders it creates for you. We cannot read the rest of your Drive, and we do not try to.",
      "You are responsible for what happens under your Google account. Tell us immediately if you believe your account has been compromised.",
    ],
  },
  {
    h: "Acceptable use",
    p: [
      "Do not use G_Cloister to store or distribute unlawful material, to infringe someone else's copyright or privacy, to distribute malware, to harass people, or to violate any third party's rights.",
      "Do not attempt to bypass room passwords, the per-room size limits, or the rate limits. Do not abuse the service with automated bulk traffic.",
      "A room's contents are the host's responsibility. If a host uses a room to share something unlawful, the host, not the people who joined it, is responsible.",
    ],
  },
  {
    h: "Availability and limits",
    p: [
      "The service is offered for free, with no uptime guarantee. Parts of it may be taken offline for maintenance, and free-tier hosting may pause idle instances between uses.",
      "Per-room storage is capped (5 GB by default) and individual uploads are capped (2 GB by default). Those limits can change.",
    ],
  },
  {
    h: "No warranty",
    p: [
      "G_Cloister is provided without warranties of any kind, express or implied, including fitness for a particular purpose. We do not guarantee that files will be uploaded, synced, downloaded or previewed without interruption or error.",
      "Always keep your own copy of anything that matters. A host's Drive folder is the only copy of the files in a room; if it is deleted, the files are gone.",
    ],
  },
  {
    h: "Limitation of liability",
    p: [
      "To the maximum extent permitted by law, the maintainers of G_Cloister are not liable for lost files, lost profits, data loss, or any indirect or consequential damages arising from your use of the service.",
    ],
  },
  {
    h: "Termination",
    p: [
      "You can stop using G_Cloister and delete your room at any time. We may suspend accounts that violate these terms, or that abuse the service.",
    ],
  },
  {
    h: "Changes",
    p: [
      "These terms may be updated as the service evolves. The date at the top of this page reflects the latest version.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
          Legal
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,46px)] font-black leading-[0.95] tracking-[-0.04em]">
          Terms of Service
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
          <Link href="/privacy" className="text-sm text-gc-muted underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
