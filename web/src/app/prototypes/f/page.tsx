"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { RoomPreview } from "@/components/room-preview";
import { ProtoCtas, useProtoStart } from "@/components/proto/proto-cta";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";

const EASE = [0.16, 1, 0.3, 1] as const;

const MARQUEE =
  "REAL TIME - YOUR DRIVE - LOCKED CODE - 5 GB FREE - YOUR RULES - REAL TIME - YOUR DRIVE - LOCKED CODE - 5 GB FREE - YOUR RULES";

const BAND = [
  { word: "Real time", body: "Uploads stream to every open screen instantly." },
  { word: "Your Drive", body: "The host's Google Drive does all the storing." },
  { word: "Locked code", body: "A password per room, hashed and never left in plaintext." },
];

const ROWS = [
  {
    word: "Sync",
    body: "Uploads, renames and deletes land on every screen at once, no refresh needed.",
    tag: "socket.io",
  },
  {
    word: "Storage",
    body: "A dedicated folder inside the host's Google Drive. The app can only see what it creates.",
    tag: "drive.file",
  },
  {
    word: "Control",
    body: "Kick or re-admit members, set limits and purge the folder from one panel.",
    tag: "host panel",
  },
  {
    word: "Guard",
    body: "bcrypt room codes, AES-256-GCM tokens and 15-minute self-revoking preview links.",
    tag: "aes-256-gcm",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Host",
    body: "Sign in with Google. Pick a room ID, set a password. A folder appears inside your Drive.",
  },
  {
    n: "02",
    title: "Pass the code",
    body: "Send the room ID and password. One door, everyone walks in.",
  },
  {
    n: "03",
    title: "Drop",
    body: "Files stream to every screen in real time, and into the host's Drive.",
  },
];

export default function PrototypeFPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-[#0b0d12] text-[#f4f6f9] antialiased"
      style={{ "--proto-accent": "#4456e8", "--proto-accent-strong": "#3345d6" } as CSSProperties}
    >
      {/* nav */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-baseline gap-1.5" aria-label="G_Cloister home">
            <span className="inline-flex -rotate-3 items-center justify-center rounded-lg bg-proto-accent px-1.5 py-1 text-[13px] font-black tracking-tight text-white">
              G_
            </span>
            <span className="text-[17px] font-black tracking-tight">CLOISTER</span>
          </Link>
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8b93a1] md:flex">
            {[
              ["Features", "features"],
              ["How it works", "how"],
              ["Security", "security"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition-colors hover:text-white">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#8b93a1] transition-colors hover:border-white/40 hover:text-white"
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
        <section className="mx-auto max-w-[1360px] px-6 pb-16 pt-20 md:pt-24">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7c8bff]"
          >
            Private file rooms on your drive
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="mt-6 font-black leading-[0.9] tracking-[-0.05em] text-[clamp(52px,9vw,120px)]"
          >
            YOUR FILES.
            <br />
            <span className="text-[#8b93a1]">YOUR</span>{" "}
            <span className="inline-block -rotate-1 rounded-2xl bg-proto-accent px-[0.08em] py-[0.03em] text-white">
              DRIVE.
            </span>
          </motion.h1>

          <div className="mt-12 grid grid-cols-1 items-end gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            >
              <p className="max-w-[44ch] text-[16px] leading-relaxed text-[#8b93a1]">
                Password-locked rooms that stream every upload in real time,
                stored on the host's own Google Drive.
              </p>
              <div className="mt-8">
                <ProtoCtas mode="dark" />
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30, rotate: 1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
              className="relative"
            >
              <span
                aria-hidden
                className="absolute -right-6 -top-14 hidden font-mono text-[120px] font-bold leading-none text-white/[0.05] lg:block"
              >
                204
              </span>
              <RoomPreview tone="dark" />
            </motion.div>
          </div>
        </section>

        {/* marquee */}
        <div aria-hidden className="overflow-hidden border-y border-white/10 py-4">
          <div className="marquee-track flex w-max">
            {[MARQUEE, MARQUEE].map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-6 pr-6 font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-[#565e6b] whitespace-nowrap"
              >
                {m.split(" - ").map((w, j) => (
                  <span key={j} className="flex items-center gap-6">
                    {w}
                    <span className="text-proto-accent">/</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* cobalt band */}
        <section className="bg-proto-accent text-white">
          <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-px md:grid-cols-3">
            {BAND.map((b) => (
              <motion.div
                key={b.word}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="px-8 py-10 md:py-14"
              >
                <h3 className="text-[28px] font-black tracking-[-0.03em]">{b.word}</h3>
                <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-white/80">
                  {b.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* big-type rows */}
        <section id="features" className="mx-auto max-w-[1360px] scroll-mt-20 px-6 py-16 md:py-24">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="text-[clamp(30px,4vw,48px)] font-black tracking-[-0.03em]">
              What you get.
            </h2>
            <ArrowRight size={22} className="hidden h-9 w-9 text-[#f4f6f9] md:block" />
          </div>
          <div className="mt-8 flex flex-col">
            {ROWS.map((r, i) => (
              <motion.div
                key={r.word}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
                className="group grid grid-cols-1 items-baseline gap-2 border-t border-white/12 py-8 transition-colors hover:border-proto-accent sm:grid-cols-[200px_1fr_auto] sm:gap-10"
              >
                <h3 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em] transition-transform duration-200 group-hover:translate-x-1.5">
                  {r.word}
                </h3>
                <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#8b93a1]">{r.body}</p>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#565e6b] sm:text-right">
                  {r.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="scroll-mt-20 border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-[1360px] px-6 py-16 md:py-24">
            <h2 className="text-[clamp(30px,4vw,48px)] font-black tracking-[-0.03em]">
              Three moves.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                  className="rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-proto-accent">{s.n}</span>
                    {i < 2 && (
                      <ArrowRight size={18} className="text-[#565e6b]" />
                    )}
                  </div>
                  <h3 className="mt-8 text-[24px] font-black tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#8b93a1]">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* security - mono strip */}
        <section id="security" className="mx-auto max-w-[1360px] scroll-mt-20 px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-black tracking-[-0.03em]">
              Built locked.
            </h2>
            <div className="flex flex-col">
              {[
                ["drive.file scope", "The app can only read and write the folder it creates."],
                ["AES-256-GCM", "Tokens are encrypted before they touch disk."],
                ["bcrypt", "Room passwords are hashed, never plaintext."],
                ["15-min previews", "Share links expire and revoke themselves."],
              ].map(([title, body], i) => (
                <motion.div
                  key={title}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
                  className="grid grid-cols-1 gap-1 border-t border-white/12 py-4 sm:grid-cols-[220px_1fr] sm:gap-6"
                >
                  <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#7c8bff]">
                    {title}
                  </span>
                  <p className="text-[14px] leading-relaxed text-[#8b93a1]">{body}</p>
                </motion.div>
              ))}
              <div className="border-t border-white/12" />
            </div>
          </div>
        </section>

        {/* final cta */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-[1360px] px-6 py-24 text-center md:py-32">
            <motion.h2
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-balance font-black leading-[0.92] tracking-[-0.05em] text-[clamp(46px,7.6vw,104px)]"
            >
              OPEN A ROOM.
              <br />
              <span className="inline-block -rotate-1 rounded-3xl bg-proto-accent px-[0.12em] text-white">
                KEEP THE FILES.
              </span>
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
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-7 font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#565e6b]"
            >
              Free. 5 GB per room. Your Drive, your rules.
            </motion.p>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-6 py-7 font-mono text-[11px] uppercase tracking-[0.12em] text-[#565e6b] md:flex-row">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 -rotate-3 items-center justify-center rounded bg-proto-accent text-[8px] font-black text-white">
              G_
            </span>
            G_CLOISTER © {new Date().getFullYear()}
          </span>
          <a
            href="https://github.com/qwyuvanyt8-commits/G_Cloister"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7c8bff] transition-colors hover:text-white"
          >
            MIT · GitHub source
          </a>
          <span>Built on the Google Drive API</span>
        </div>
      </footer>

      <ProtoSwitcher />
    </div>
  );
}