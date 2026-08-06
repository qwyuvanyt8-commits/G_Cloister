"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  GoogleLogo,
  Key,
  Lightning,
  LockKey,
  PaperPlaneTilt,
  FolderSimple,
  Cloud,
  ArrowDown,
  ArrowRight,
} from "@phosphor-icons/react";
import { LandingNav } from "@/components/landing-nav";
import { RoomPreview } from "@/components/room-preview";
import { Button, Logo } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/cn";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

const marqueeItems = [
  "PDF", "MOV", "PNG", "ZIP", "FIG", "MP4", "XLSX", "DOCX", "RAW", "MP3", "AI", "SKETCH", "WEBP", "PSD",
];

export default function LandingPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  return (
    <main className="relative overflow-x-clip">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-[140vh]" aria-hidden />

      <LandingNav />

      {/* ---------------- HERO ---------------- */}
      <section className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-5 pb-24 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-40">
        <div className="relative z-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 text-[12.5px] font-medium text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Runs on your Google Drive
            </span>
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tighter text-ink sm:text-6xl lg:text-[76px]"
          >
            Files, gathered
            <br />
            in <em className="text-accent-gradient font-semibold not-italic">private rooms</em>.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted"
          >
            Host a room on your Drive, share a code, and move up to 5&nbsp;GB in real time.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              onClick={user ? () => router.push("/home") : signIn}
              loading={loading}
              icon={user ? <ArrowRight size={19} weight="bold" /> : <GoogleLogo size={19} weight="bold" />}
            >
              {user ? "Go to rooms" : "Sign in with Google"}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
              icon={<ArrowDown size={18} />}
            >
              See how it works
            </Button>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-5 text-[13px] text-faint"
          >
            Free to host · No storage to buy · Google account required
          </motion.p>
        </div>

        <RoomPreview className="relative mx-auto w-full max-w-[440px] lg:justify-self-end" />
      </section>

      {/* ---------------- FILE TYPE MARQUEE ---------------- */}
      <section className="relative border-y border-border bg-surface/40 py-6 backdrop-blur-sm">
        <div className="flex w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="marquee-track flex w-max shrink-0 items-center gap-10 pr-10">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 font-mono text-[15px] tracking-widest text-faint"
              >
                {item}
                <span className="h-1 w-1 rounded-full bg-accent/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how" className="relative mx-auto max-w-[1400px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
            >
              <h2 className="text-balance text-4xl font-semibold tracking-tighter text-ink lg:text-5xl">
                Three steps to a
                <br />
                shared <span className="text-accent">vault</span>.
              </h2>
              <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-muted">
                No sign-up forms, no invite emails. Your Google account is the only
                key you need.
              </p>
            </motion.div>
          </div>

          <div>
            {[
              {
                n: "01",
                icon: Key,
                title: "Host a room",
                body: "Pick a room ID — words or numbers, your call. We generate a password and carve a G_Cloister folder inside your own Drive.",
              },
              {
                n: "02",
                icon: PaperPlaneTilt,
                title: "Share the code",
                body: "Send the room ID and password to the people you trust. One code, one door. Nothing else is needed to walk in.",
              },
              {
                n: "03",
                icon: Lightning,
                title: "Drop files together",
                body: "Upload anything up to 5 GB total. Every member sees files appear the moment they land — no refresh, no waiting.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                variants={reveal}
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "group flex gap-6 py-8 first:pt-2",
                  i > 0 && "border-t border-border"
                )}
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface font-mono text-[13px] font-medium text-muted transition-colors group-hover:border-accent-border group-hover:text-accent">
                    {step.n}
                  </span>
                  {i < 2 && <span className="mt-3 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2.5">
                    <step.icon size={19} weight="duotone" className="text-accent" />
                    <h3 className="text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  </div>
                  <p className="mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES BENTO ---------------- */}
      <section id="features" className="relative border-t border-border bg-surface-2/50">
        <div className="mx-auto max-w-[1400px] px-5 py-24 lg:px-8 lg:py-32">
          <motion.div
            variants={reveal}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-balance text-4xl font-semibold tracking-tighter text-ink lg:text-5xl">
              A vault with the room to breathe.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {/* Big number cell */}
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-accent-border bg-accent-soft p-7 md:col-span-4 md:min-h-[260px]"
            >
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
              />
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent">The vault</p>
              <div className="mt-6 flex flex-wrap items-end gap-x-3">
                <span className="text-6xl font-semibold tracking-tighter text-ink lg:text-7xl">5.0 GB</span>
                <span className="mb-2 text-[15px] font-medium text-muted">per room</span>
              </div>
              <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-muted">
                The space is carved from the host's Google Drive — so a room costs
                nothing and your files stay in a place you already own.
              </p>
              <div className="mt-6 h-2 max-w-sm overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: "12%" }}
                  whileInView={{ width: "12%" }}
                />
              </div>
            </motion.div>

            {/* Real-time cell */}
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-7 md:col-span-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
                <Lightning size={22} weight="duotone" className="text-accent" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink">Real time, always</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  Files land in every open room the second they're uploaded.
                </p>
              </div>
            </motion.div>

            {/* Drive tree cell */}
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-7 md:col-span-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5aa2ff]/10">
                <FolderSimple size={22} weight="duotone" className="text-[#5aa2ff]" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                G_Cloister in your Drive
              </h3>
              <div className="mt-4 rounded-xl bg-surface-2 p-3.5 font-mono text-[12.5px] leading-relaxed text-muted">
                <p className="flex items-center gap-2">
                  <FolderSimple size={14} className="text-accent" weight="duotone" /> My Drive / G_Cloister
                </p>
                <p className="ml-5 flex items-center gap-2">
                  <FolderSimple size={13} className="text-[#5aa2ff]" weight="duotone" /> vault-alpha
                </p>
                <p className="ml-10 flex items-center gap-2 text-faint">
                  <Cloud size={12} className="text-accent" weight="duotone" /> 4 files
                </p>
              </div>
            </motion.div>

            {/* Invite code cell */}
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-7 md:col-span-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0b04e]/10">
                <PaperPlaneTilt size={22} weight="duotone" className="text-[#f0b04e]" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink">One code to enter</h3>
                <p className="mt-2 font-mono text-[13px] tracking-widest text-accent">vault-alpha</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  Paste the code anywhere — chat, email, a sticky note.
                </p>
              </div>
            </motion.div>

            {/* Password cell */}
            <motion.div
              variants={reveal}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-7 md:col-span-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-soft">
                <LockKey size={22} weight="duotone" className="text-danger" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">Password on every door</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                Every room has its own password, hashed before it ever touches a
                database.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- PRIVACY ---------------- */}
      <section id="privacy" className="relative mx-auto max-w-[1400px] px-5 py-24 lg:px-8 lg:py-32">
        <motion.div
          variants={reveal}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">Privacy</span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">
            Your files live in the host's Google Drive.
            <span className="text-muted"> Not ours.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted">
            We don't rent cloud space, we don't scan your uploads, and we don't sell
            your data. Room access is guarded by a password, and the host can revoke
            the vault anytime by revoking Drive access.
          </p>
        </motion.div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center lg:py-36">
          <motion.h2
            variants={reveal}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            className="text-balance text-5xl font-semibold leading-[1.02] tracking-tighter text-ink lg:text-6xl"
          >
            Open your
            <br />
            cloister<span className="text-accent">.</span>
          </motion.h2>
          <motion.div
            variants={reveal}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              onClick={user ? () => router.push("/home") : signIn}
              loading={loading}
              icon={user ? <ArrowRight size={19} weight="bold" /> : <GoogleLogo size={19} weight="bold" />}
            >
              {user ? "Go to rooms" : "Sign in with Google"}
            </Button>
            <p className="text-[13px] text-faint">Takes about ten seconds. Your Drive does the heavy lifting.</p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row lg:px-8">
          <Logo size={26} />
          <p className="font-mono text-[12px] text-faint">
            Built on the Google Drive API · {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[13px] text-faint">Your Drive · Your rules</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
