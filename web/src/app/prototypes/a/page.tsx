"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CloudCheck,
  GithubLogo,
  HardDrive,
  Lightning,
  LockKey,
  ShieldCheck,
  Users,
} from "@phosphor-icons/react";
import { RoomPreview } from "@/components/room-preview";
import { ProtoCtas, useProtoStart } from "@/components/proto/proto-cta";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    size: "lg" as const,
    icon: HardDrive,
    title: "Built on your Drive",
    body: "Every file lands in a dedicated G_Cloister folder inside the host's Google Drive. The app can only see the folder it creates.",
    tag: "drive.file scope",
    visual: "tint" as const,
  },
  {
    size: "sm" as const,
    icon: Lightning,
    title: "Real-time by default",
    body: "Uploads, renames, deletes and members stream to every open screen the moment they happen.",
    tag: "socket.io",
    visual: "plain" as const,
  },
  {
    size: "sm" as const,
    icon: LockKey,
    title: "One code, one door",
    body: "Every room carries an auto or custom password, hashed with bcrypt and never stored in plaintext.",
    tag: "bcrypt",
    visual: "plain" as const,
  },
  {
    size: "lg" as const,
    icon: Users,
    title: "Moderation you control",
    body: "Kick or re-admit members, set storage caps and purge the room folder straight from the panel. The host stays in charge.",
    tag: "host panel",
    visual: "grid" as const,
  },
  {
    size: "md" as const,
    icon: CloudCheck,
    title: "Sync to your own cloud",
    body: "Members can auto-mirror the room into their personal Drive. No third-party storage and no middleman.",
    tag: "opt-in mirror",
    visual: "plain" as const,
  },
  {
    size: "md" as const,
    icon: ShieldCheck,
    title: "Zero-knowledge by design",
    body: "Google tokens are wrapped in AES-256-GCM at rest. Share links expire after 15 minutes and revoke themselves.",
    tag: "aes-256-gcm",
    visual: "glow" as const,
  },
];

const STEPS = [
  {
    n: "1",
    title: "Reserve a room",
    body: "Sign in with Google, pick a room ID and set a password. A folder is carved inside your Drive.",
  },
  {
    n: "2",
    title: "Pass the code",
    body: "Share the room ID and password however you like. One code opens the door for everyone.",
  },
  {
    n: "3",
    title: "Drop files live",
    body: "Everyone uploads into the same room and every open screen updates in real time.",
  },
];

const SECURITY = [
  {
    title: "drive.file scope",
    body: "The app can only read and write the folder it creates. Your personal files stay untouched.",
  },
  {
    title: "AES-256-GCM at rest",
    body: "OAuth tokens are encrypted before they ever touch disk.",
  },
  {
    title: "bcrypt passwords",
    body: "Room passwords are hashed. Plaintext never exists on the server.",
  },
  {
    title: "15-minute previews",
    body: "View links expire and revoke themselves automatically.",
  },
];

export default function PrototypeAPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-[#090b0f] text-[#eef1f6] antialiased"
      style={{ "--proto-accent": "#5a6cff", "--proto-accent-strong": "#4456e8" } as CSSProperties}
    >
      {/* nav */}
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="G_Cloister home">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-proto-accent text-[11px] font-black text-white">
              G_
            </span>
            <span className="text-[16px] font-bold tracking-tight">G_Cloister</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-[#98a0ad] md:flex">
            {[
              ["Features", "features"],
              ["How it works", "how"],
              ["Security", "security"],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/qwyuvanyt8-commits/G_Cloister"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="G_Cloister source on GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-[#98a0ad] transition-colors hover:border-white/40 hover:text-white"
            >
              <GithubLogo size={17} />
            </a>
            <button
              type="button"
              onClick={start}
              className="inline-flex h-9 items-center justify-center rounded-full bg-proto-accent px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-proto-accent-strong"
            >
              {hostLabel}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pt-16">
          <div>
            <motion.span
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7c8bff]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-proto-accent" />
              Private file rooms
            </motion.span>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: EASE }}
              className="mt-4 text-balance font-semibold leading-[0.98] tracking-[-0.04em] text-[clamp(38px,5.4vw,64px)]"
            >
              Private rooms.
              <br />
              Your Drive does{" "}
              <span className="text-[#7c8bff]">the storing.</span>
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: EASE }}
              className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[#98a0ad]"
            >
              Share files in password-locked rooms that stream in real time.
              Storage lives on your own Google Drive.
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
              className="mt-8"
            >
              <ProtoCtas mode="dark" />
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
          >
            <RoomPreview tone="dark" />
          </motion.div>
        </section>

        {/* features */}
        <section id="features" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-16 md:py-20">
          <h2 className="max-w-[18ch] text-balance text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Everything a shared folder should have, none of the cloud bill.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.06, ease: EASE }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/8 p-6 transition-colors duration-200 hover:border-white/20",
                  f.size === "lg" && "md:col-span-7",
                  f.size === "sm" && "md:col-span-5",
                  f.size === "md" && "md:col-span-6",
                  f.visual === "tint" && "border-[#5a6cff]/30 bg-[#5a6cff]/[0.07]",
                  f.visual === "glow" && "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(90,108,255,0.18),transparent_55%)]",
                  f.visual === "grid" &&
                    "bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:22px_22px]",
                  f.visual === "plain" && "bg-white/[0.025]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      f.visual === "tint" ? "bg-[#5a6cff] text-white" : "border border-white/10 bg-white/[0.04] text-[#7c8bff]"
                    )}
                  >
                    <f.icon size={19} weight="duotone" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5b6472]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-[19px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-[#98a0ad]">
                  {f.body}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="scroll-mt-20 border-t border-white/8 bg-[#0c1016]">
          <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
            <h2 className="text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Three moves, one key.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                  className="relative rounded-2xl border border-white/8 bg-white/[0.02] p-6"
                >
                  <span className="font-mono text-[12px] text-[#7c8bff]">{s.n} / 03</span>
                  <h3 className="mt-3 text-[17px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#98a0ad]">{s.body}</p>
                  {i < 2 && (
                    <ArrowRight
                      size={18}
                      className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-[#5b6472] md:block"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* security */}
        <section id="security" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <h2 className="max-w-[16ch] text-balance text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Built for privacy, from the first byte.
              </h2>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-[#98a0ad]">
                The technical guarantees are concrete, not promises. Here is what
                the server actually does and limits itself to.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2">
              {SECURITY.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                  className="bg-[#0c1016] p-6"
                >
                  <h3 className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#7c8bff]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#98a0ad]">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* final cta */}
        <section className="border-t border-white/8 bg-[#0c1016]">
          <div className="mx-auto max-w-[760px] px-6 py-24 text-center md:py-28">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.02] tracking-[-0.04em]"
            >
              Your first room takes about a minute.
            </motion.h2>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mt-9"
            >
              <ProtoCtas mode="dark" />
            </motion.div>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 font-mono text-[11.5px] tracking-[0.06em] text-[#5b6472]"
            >
              Free. 5 GB per room. Hosted on your own Google Drive.
            </motion.p>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#5b6472]">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-proto-accent text-[8px] font-black text-white">
              G_
            </span>
            G_Cloister © {new Date().getFullYear()}. MIT licensed.
          </span>
          <span className="font-mono text-[11px] tracking-wide text-[#5b6472]">
            Built on the Google Drive API
          </span>
          <a
            href="https://github.com/qwyuvanyt8-commits/G_Cloister"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] tracking-wide text-[#7c8bff] transition-colors hover:text-white"
          >
            GitHub source
          </a>
        </div>
      </footer>

      <ProtoSwitcher />
    </div>
  );
}