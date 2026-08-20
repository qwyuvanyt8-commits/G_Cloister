"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { GithubLogo } from "@phosphor-icons/react";
import { RoomPreview } from "@/components/room-preview";
import { ProtoCtas, useProtoStart } from "@/components/proto/proto-cta";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";

const EASE = [0.16, 1, 0.3, 1] as const;

const ISSUES = [
  {
    kicker: "Storage",
    title: "A folder inside your Drive",
    body: "Every upload lands in a dedicated G_Cloister folder on the host's Google Drive. The app uses the restricted drive.file scope and can only see what it creates.",
  },
  {
    kicker: "Sync",
    title: "Live, without refresh",
    body: "Uploads, renames, deletes and member presence stream to every open screen at once. One connection, every event.",
  },
  {
    kicker: "Control",
    title: "The host decides",
    body: "Set storage caps, kick or re-admit members, and purge the room folder from a single panel. When you leave, the files stay yours.",
  },
];

const FIGURES = [
  { value: "5 GB", label: "per room" },
  { value: "15 min", label: "preview links" },
  { value: "2x", label: "encrypted: bcrypt + AES-256-GCM" },
];

const ENDNOTES = [
  "drive.file scope - the app can only read and write the folder it creates.",
  "AES-256-GCM - Google tokens are encrypted before they ever touch disk.",
  "bcrypt - room passwords are hashed and never stored in plaintext.",
  "15-minute previews - share links expire and revoke themselves.",
];

export default function PrototypeEPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-[#14110d] text-[#efe9dd] antialiased"
      style={{ "--proto-accent": "#6c7cff", "--proto-accent-strong": "#5164e8" } as CSSProperties}
    >
      {/* masthead */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="G_Cloister home">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-proto-accent text-[11px] font-black text-white">
              G_
            </span>
            <span className="text-[15px] font-bold tracking-tight">G_Cloister</span>
          </Link>
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em] text-[#b3a993] md:flex">
            {[
              ["In this issue", "issue"],
              ["The fine print", "fineprint"],
              ["Open a room", "open"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition-colors hover:text-[#efe9dd]">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#b3a993] transition-colors hover:border-white/40 hover:text-white"
            >
              <GithubLogo size={17} />
            </a>
            <button
              type="button"
              onClick={start}
              className="inline-flex h-9 items-center justify-center rounded-full bg-proto-accent px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-proto-accent-strong"
            >
              {hostLabel}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-[1240px] px-6 pb-20 pt-20 md:pb-24 md:pt-28">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-proto-accent"
            >
              Private file rooms
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              className="mt-6 max-w-[14ch] font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(44px,6.4vw,80px)] text-balance"
            >
              A room that lives{" "}
              <span className="text-proto-accent">in your Drive.</span>
            </motion.h1>

            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
                className="max-w-[48ch] text-[16.5px] leading-[1.7] text-[#b3a993]"
              >
                Password-locked rooms that stream in real time. Files stay on
                the host's Google Drive, so storage is always free.
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
                className="md:pl-10"
              >
                <RoomPreview tone="dark" sharp />
                <p className="mt-4 font-mono text-[11px] tracking-wide text-[#7c7360]">
                  Fig. 204 - a room with four members, streaming mid-upload.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
              className="mt-14"
            >
              <ProtoCtas mode="dark" />
            </motion.div>
          </div>
        </section>

        {/* figures */}
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {FIGURES.map((f, i) => (
              <motion.div
                key={f.value}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="px-8 py-9"
              >
                <p className="font-mono text-[30px] font-semibold text-[#efe9dd]">{f.value}</p>
                <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[#7c7360]">
                  {f.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* in this issue */}
        <section id="issue" className="mx-auto max-w-[1240px] scroll-mt-20 px-6 py-24 md:py-28">
          <div className="mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] font-medium leading-[1.02] tracking-[-0.03em]">
              In this issue
            </h2>
            <p className="mt-2 max-w-[52ch] font-mono text-[11.5px] uppercase tracking-[0.14em] text-[#7c7360]">
              Three features: the room, the storage and the door.
            </p>
          </div>

          <div className="flex flex-col">
            {ISSUES.map((it, i) => (
              <motion.div
                key={it.kicker}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
                className="grid grid-cols-1 border-t border-white/12 py-8 md:grid-cols-[140px_260px_1fr] md:gap-8"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-proto-accent">
                  {it.kicker}
                </span>
                <h3 className="text-[clamp(22px,2.6vw,32px)] font-medium tracking-[-0.02em] text-[#efe9dd]">
                  {it.title}
                </h3>
                <p className="mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-[#b3a993] md:mt-0">
                  {it.body}
                </p>
              </motion.div>
            ))}
            <div className="border-t border-white/12" />
          </div>
        </section>

        {/* cobalt statement */}
        <section className="bg-proto-accent text-[#f7f6f2]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-[840px] px-6 py-24 text-center md:py-28"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#f7f6f2]/70">
              The fine print, in full
            </p>
            <h2 className="mt-6 text-balance font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(30px,4.4vw,54px)]">
              Files live in the host's Drive. We can't see them. That's the
              whole privacy policy.
            </h2>
          </motion.div>
        </section>

        {/* endnotes */}
        <section id="fineprint" className="mx-auto max-w-[1240px] scroll-mt-20 px-6 py-20 md:py-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.6fr_1.4fr]">
            <h2 className="text-[clamp(26px,3.2vw,40px)] font-medium leading-[1.04] tracking-[-0.03em]">
              Security, as endnotes.
            </h2>
            <div className="flex flex-col">
              {ENDNOTES.map((note, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
                  className="grid grid-cols-[44px_1fr] gap-4 border-t border-white/10 py-4"
                >
                  <span className="font-mono text-[12px] text-proto-accent">{i + 1}.</span>
                  <p className="font-mono text-[13px] leading-relaxed text-[#b3a993]">{note}</p>
                </motion.div>
              ))}
              <div className="border-t border-white/10" />
            </div>
          </div>
        </section>

        {/* final cta */}
        <section id="open" className="mx-auto max-w-[860px] scroll-mt-20 px-6 py-24 text-center md:py-32">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-balance font-medium leading-[1.0] tracking-[-0.04em] text-[clamp(38px,5.4vw,68px)]"
          >
            Your first room,
            <br />
            <span className="text-proto-accent">about a minute from now.</span>
          </motion.h2>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-10"
          >
            <ProtoCtas mode="dark" />
          </motion.div>
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 font-mono text-[11.5px] tracking-[0.1em] text-[#7c7360]"
          >
            Free. 5 GB per room. Your Drive, your rules.
          </motion.p>
        </section>
      </main>

      {/* colophon */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-6 py-7 font-mono text-[11px] tracking-wide text-[#7c7360] md:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-proto-accent text-[8px] font-black text-white">
              G_
            </span>
            G_Cloister © {new Date().getFullYear()}. MIT licensed.
          </span>
          <span>Vol. 1 - Built on the Google Drive API</span>
          <a
            href="https://github.com/qwyuvanyt8-commits/G_Cloister"
            target="_blank"
            rel="noopener noreferrer"
            className="text-proto-accent transition-colors hover:text-[#efe9dd]"
          >
            GitHub source
          </a>
        </div>
      </footer>

      <ProtoSwitcher />
    </div>
  );
}