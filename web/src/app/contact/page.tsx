import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — G_Cloister",
  description: "How to reach the people behind G_Cloister.",
};

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-16">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
          Contact
        </p>
        <h1 className="mt-4 text-[clamp(30px,5vw,46px)] font-black leading-[0.95] tracking-[-0.04em]">
          Talk to a human.
        </h1>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-white/10 bg-[#12151c] p-6 sm:p-8">
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">Support email</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              For anything about accounts, rooms, files, the privacy policy or a
              security disclosure, write to
            </p>
            <a
              href="mailto:yuvanreddy404@gmail.com"
              className="mt-3 inline-block font-mono text-[15px] text-[#7c8bff] underline-offset-4 hover:underline"
            >
              yuvanreddy404@gmail.com
            </a>
            <p className="mt-4 text-[14px] leading-relaxed text-gc-muted">
              This inbox is monitored by the project maintainer. Replies usually
              arrive within a couple of business days. If you have found a security
              problem, please mark the subject line &ldquo;security&rdquo; and
              include the steps to reproduce it — reports are treated as confidential
              and fixed before they are made public.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">Source code</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              G_Cloister is open source under the MIT licence. Issues, bug reports
              and pull requests are welcome on GitHub:
            </p>
            <a
              href="https://github.com/qwyuvanyt8-commits/G_Cloister"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-mono text-[15px] text-[#7c8bff] underline-offset-4 hover:underline"
            >
              github.com/qwyuvanyt8-commits/G_Cloister
            </a>
          </section>

          <section>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">A note on sign-in</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gc-muted">
              Signing in is handled entirely by Google. G_Cloister never asks for
              your Google password, never sees it, and never asks you to paste
              passwords into a form on this site. If a page ever asks you to type a
              Google password, it is not us — please report it to the address above.
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
          <Link href="/about" className="text-sm text-gc-muted underline-offset-4 hover:underline">
            About
          </Link>
        </div>
      </div>
    </main>
  );
}
