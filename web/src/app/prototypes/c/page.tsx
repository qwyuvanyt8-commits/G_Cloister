"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { RoomPreview } from "@/components/room-preview";
import { ProtoCtas, useProtoStart } from "@/components/proto/proto-cta";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";

const EASE = [0.16, 1, 0.3, 1] as const;

const BAND = [
  { word: "Real time", body: "Uploads stream to every open screen instantly." },
  { word: "Your Drive", body: "The host's Google Drive does all the storing." },
  { word: "Locked code", body: "A password per room, hashed and never left in plaintext." },
];

const BIG_ROWS = [
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
    word: "Host",
    body: "Sign in with Google. Pick a room ID, set a password. A folder appears inside your Drive.",
  },
  {
    word: "Pass the code",
    body: "Send the room ID and password. One door, everyone walks in.",
  },
  {
    word: "Drop",
    body: "Files stream to every screen in real time, and into the host's Drive.",
  },
];

export default function PrototypeCPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-[#fbfbfa] text-[#0b0d12] antialiased"
      style={{ "--proto-accent": "#1e3bf3", "--proto-accent-strong": "#1629b5" } as CSSProperties}
    >
      {/* nav */}
      <header className="border-b border-[#0b0d12]/10">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-baseline gap-1.5" aria-label="G_Cloister home">
            <span className="inline-flex -rotate-2 items-center justify-center rounded-lg bg-proto-accent px-1.5 py-1 text-[13px] font-black tracking-tight text-white">
              G_
            </span>
            <span className="text-[17px] font-black tracking-tight">CLOISTER</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[#5a6472] md:flex">
            {[
              ["What you get", "features"],
              ["How it works", "how"],
              ["Control", "control"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition-colors hover:text-[#0b0d12]">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0b0d12]/15 text-[#5a6472] transition-colors hover:border-[#0b0d12]/50 hover:text-[#0b0d12]"
            >
              <GithubLogo size={17} />
            </a>
            <button
              type="button"
              onClick={start}
              className="inline-flex h-9 items-center justify-center rounded-full bg-proto-accent px-5 text-[13.5px] font-semibold text-white transition-all hover:bg-proto-accent-strong active:scale-[0.98]"
            >
              {hostLabel}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-6 pb-20 pt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pt-16">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-proto-accent"
            >
              Private file rooms on your drive
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: EASE }}
              className="mt-5 text-balance font-black leading-[0.93] tracking-[-0.045em] text-[clamp(44px,7vw,84px)]"
            >
              Private rooms,
              <br />
              streamed{" "}
              <span className="inline-block -rotate-1 rounded-2xl bg-proto-accent px-[0.12em] text-white">
                in real time.
              </span>
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: EASE }}
              className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[#5a6472]"
            >
              Password-locked file rooms that stream every upload live. Storage
              lives on the host's own Google Drive.
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="mt-8"
            >
              <ProtoCtas mode="light" />
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            className="md:-mb-10"
          >
            <RoomPreview tone="light" />
            <p className="mt-3 px-1 font-mono text-[11px] tracking-wide text-[#9aa3b0]">
              scriptorium-204, four members, streaming now.
            </p>
          </motion.div>
        </section>

        {/* cobalt band */}
        <section className="bg-proto-accent text-white">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-px md:grid-cols-3">
            {BAND.map((b, i) => (
              <motion.div
                key={b.word}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                className="px-8 py-10 md:py-14"
              >
                <h3 className="text-[26px] font-black tracking-[-0.03em]">{b.word}</h3>
                <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-white/80">
                  {b.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* big-type rows */}
        <section id="features" className="mx-auto max-w-[1240px] scroll-mt-20 px-6 py-16 md:py-24">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em]">
              What you get.
            </h2>
            <ArrowRight size={22} className="hidden h-9 w-9 text-[#0b0d12] md:block" />
          </div>
          <div className="mt-8 flex flex-col">
            {BIG_ROWS.map((r, i) => (
              <motion.div
                key={r.word}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
                className="group grid grid-cols-1 items-baseline gap-2 border-t border-[#0b0d12]/15 py-7 transition-colors hover:border-proto-accent sm:grid-cols-[180px_1fr_auto] sm:gap-8"
              >
                <h3 className="text-[clamp(30px,4vw,44px)] font-black tracking-[-0.03em] transition-transform duration-200 group-hover:translate-x-1">
                  {r.word}
                </h3>
                <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#5a6472]">{r.body}</p>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9aa3b0] sm:text-right">
                  {r.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="scroll-mt-20 bg-[#0b0d12] text-white">
          <div className="mx-auto max-w-[1240px] px-6 py-16 md:py-24">
            <h2 className="text-[clamp(30px,4vw,46px)] font-black tracking-[-0.03em]">
              Three moves.
            </h2>
            <div className="mt-10 flex flex-col">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.word}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
                  className="grid grid-cols-1 gap-2 border-t border-white/15 py-8 sm:grid-cols-[120px_220px_1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <span className="font-mono text-[13px] font-bold text-[#7c8bff]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[26px] font-black tracking-[-0.02em]">{s.word}</h3>
                  <p className="max-w-[54ch] text-[15px] leading-relaxed text-white/70">{s.body}</p>
                  {i < 2 && (
                    <ArrowRight
                      size={20}
                      className="hidden rotate-90 text-[#7c8bff] sm:block"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* final cta */}
        <section className="mx-auto max-w-[1240px] px-6 py-24 text-center md:py-32">
          <motion.h2
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-balance font-black leading-[0.94] tracking-[-0.045em] text-[clamp(44px,7vw,92px)]"
          >
            OPEN YOUR
            <br />
            <span className="inline-block -rotate-1 rounded-3xl bg-proto-accent px-[0.14em] text-white">
              FIRST ROOM.
            </span>
          </motion.h2>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-10"
          >
            <ProtoCtas mode="light" />
          </motion.div>
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#9aa3b0]"
          >
            Free. 5 GB per room. Your Drive, your rules.
          </motion.p>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-[#0b0d12]/10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.12em] text-[#9aa3b0] sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 -rotate-2 items-center justify-center rounded bg-proto-accent text-[8px] font-black text-white">
              G_
            </span>
            G_CLOISTER © {new Date().getFullYear()}
          </span>
          <a
            href="https://github.com/qwyuvanyt8-commits/G_Cloister"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#0b0d12]"
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