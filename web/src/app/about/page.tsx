import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — G_Cloister",
  description:
    "What G_Cloister is, who builds it, and why the files never touch our servers.",
};

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
          About
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,46px)] font-black leading-[0.95] tracking-[-0.04em]">
          One room. One Drive folder. No copies.
        </h1>

        <div className="mt-10 space-y-8">
          <section>
            <p className="text-[15px] leading-relaxed text-gc-muted">
              G_Cloister is a small, free, open-source web app. A host signs in with
              their own Google account, opens a room, and the app creates one folder
              inside that person&apos;s Google Drive. Anyone who has the room ID and
              the room password can drop files into that folder and watch the room
              update live.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              The project is not a business. There is no advertising, no analytics, no
              tracking and no paid tier. The source is published under the MIT licence
              and anyone can read, run or fork it.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">Where the files live</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              In the host&apos;s own Google Drive, and nowhere else. G_Cloister asks
              Google for the narrow{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[13px] text-gc-ink">
                drive.file
              </code>{" "}
              scope, which lets it see only the files and folders it creates for you.
              It cannot read the rest of your Drive, and the app stores the access
              token encrypted rather than in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">What we keep</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              A Google account ID and email, the rooms you create or join, the room
              password (as a bcrypt hash, never as text) and the names and sizes of
              the files you upload. That is the complete list — see the{" "}
              <Link href="/privacy" className="text-[#7c8bff] underline-offset-4 hover:underline">
                privacy policy
              </Link>{" "}
              for the detail.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">Built with</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              Next.js on the front, Express and Socket.IO on the back, a LibSQL
              (Turso) database for metadata, and the Google Drive API for storage.
              Hosted on Vercel and Render.
            </p>
          </section>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
          <Link
            href="/"
            className="rounded-lg bg-gc-cobalt px-4 py-2 text-sm font-semibold text-white transition hover:bg-gc-cobalt-dark"
          >
            Back to G_Cloister
          </Link>
          <Link href="/contact" className="text-sm text-gc-muted underline-offset-4 hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
