"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { GithubLogo } from "@phosphor-icons/react";
import { RoomPreview } from "@/components/room-preview";
import { ProtoCtas, useProtoStart } from "@/components/proto/proto-cta";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const METRICS = [
  { value: "5 GB", label: "Per room, free" },
  { value: "Real time", label: "Streams to every member" },
  { value: "AES-256-GCM", label: "Tokens encrypted at rest" },
  { value: "15 min", label: "Preview links self-expire" },
];

const CAPABILITIES_LEFT = [
  {
    title: "Real-time sync",
    body: "Uploads, renames, deletes and member presence stream to every open screen the moment they happen, over a single Socket.IO connection.",
  },
  {
    title: "Storage on the host's Drive",
    body: "Files live in a dedicated G_Cloister folder inside the host's Google Drive. The app uses the restricted drive.file scope and can only see what it creates.",
  },
  {
    title: "Moderation that stays with you",
    body: "Set storage limits, kick or re-admit members, and purge the room folder from the panel. The host is always in control.",
  },
];

const CAPABILITIES_RIGHT = [
  {
    title: "Passwords and room codes",
    body: "Every room carries an auto-generated or custom password, hashed with bcrypt. Nothing is ever stored in plaintext.",
  },
  {
    title: "Optional member auto-sync",
    body: "Members can mirror the room into their own Drive. No third-party service touches the files at any point.",
  },
  {
    title: "Clean handoff",
    body: "Revoke Google access and the room is gone. What you created, you control end to end.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Host reserves a room",
    body: "Sign in with Google, choose a room ID and set a password. A folder is created inside your Drive.",
  },
  {
    n: "02",
    title: "Members join with the code",
    body: "The room ID and password are all that's needed. No account setup for guests beyond the room itself.",
  },
  {
    n: "03",
    title: "Files stream to everyone",
    body: "Every upload lands on every screen at once, and in the host's Drive. When you leave the room, the files stay yours.",
  },
];

const SECURITY = [
  {
    title: "Restricted scope",
    body: "drive.file means the app can only read and write the folder it creates. Your personal files are never reachable.",
  },
  {
    title: "Encrypted tokens",
    body: "Google OAuth tokens are wrapped in AES-256-GCM before being written to the database.",
  },
  {
    title: "Hashed passwords",
    body: "Room passwords are bcrypt-hashed. Plaintext never reaches disk.",
  },
  {
    title: "Short-lived previews",
    body: "Generated view links expire after 15 minutes and revoke themselves automatically.",
  },
];

export default function PrototypeBPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-white text-[#0c0f14] antialiased"
      style={{ "--proto-accent": "#1e3bf3", "--proto-accent-strong": "#1629b5" } as CSSProperties}
    >
      {/* nav */}
      <header className="border-b border-[#0c0f14]/12">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="G_Cloister home">
            <span className="flex h-7 w-7 items-center justify-center bg-proto-accent text-[11px] font-black text-white">
              G_
            </span>
            <span className="text-[16px] font-bold tracking-tight">G_Cloister</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-[#5a6472] md:flex">
            {[
              ["Capabilities", "capabilities"],
              ["How it works", "how"],
              ["Security", "security"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition-colors hover:text-[#0c0f14]">
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
              className="inline-flex h-9 w-9 items-center justify-center border border-[#0c0f14]/15 text-[#5a6472] transition-colors hover:border-[#0c0f14]/40 hover:text-[#0c0f14]"
            >
              <GithubLogo size={17} />
            </a>
            <button
              type="button"
              onClick={start}
              className="inline-flex h-9 items-center justify-center bg-proto-accent px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-proto-accent-strong"
            >
              {hostLabel}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="border-b border-[#0c0f14]/12 bg-[#f7f8fa]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-6 py-16 md:grid-cols-[1.02fr_0.98fr] md:py-20">
            <div>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-proto-accent"
              >
                G_Cloister for teams
              </motion.p>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
                className="mt-4 text-balance text-[clamp(36px,4.9vw,60px)] font-semibold leading-[1.01] tracking-[-0.04em]"
              >
                Private rooms.{" "}
                <span className="text-proto-accent">Zero cloud bills.</span>
              </motion.h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
                className="mt-5 max-w-[47ch] text-[16px] leading-relaxed text-[#5a6472]"
              >
                Share up to 5 GB per room in real time. Files live on the host's
                Google Drive, password-locked and encrypted.
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
                className="mt-8"
              >
                <ProtoCtas mode="light" radius="sharp" />
              </motion.div>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <RoomPreview tone="light" sharp />
              <p className="mt-3 px-1 font-mono text-[11px] tracking-wide text-[#9aa3b0]">
                A room with four members, mid-upload. Storage on the host's Drive.
              </p>
            </motion.div>
          </div>
        </section>

        {/* metrics */}
        <section className="mx-auto max-w-[1180px] px-6 py-12">
          <dl className="grid grid-cols-2 gap-y-8 divide-x divide-[#0c0f14]/10 md:grid-cols-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                className={cn("px-6", i === 0 && "pl-0")}
              >
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-mono text-[26px] font-bold tracking-tight text-[#0c0f14]">
                  {m.value}
                </dd>
                <dd className="mt-1 text-[13.5px] text-[#5a6472]">{m.label}</dd>
              </motion.div>
            ))}
          </dl>
        </section>

        {/* capabilities */}
        <section id="capabilities" className="scroll-mt-20 border-t border-[#0c0f14]/12 bg-[#f7f8fa]">
          <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
            <h2 className="max-w-[20ch] text-balance text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
              A shared folder that respects ownership.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
              <div className="flex flex-col gap-10">
                {CAPABILITIES_LEFT.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
                    className="border-b border-[#0c0f14]/10 pb-10"
                  >
                    <h3 className="text-[19px] font-semibold tracking-tight">{c.title}</h3>
                    <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[#5a6472]">
                      {c.body}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col gap-10 pt-10 md:pt-16">
                {CAPABILITIES_RIGHT.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: 0.05 + i * 0.05, ease: EASE }}
                    className="border-b border-[#0c0f14]/10 pb-10"
                  >
                    <h3 className="text-[19px] font-semibold tracking-tight">{c.title}</h3>
                    <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[#5a6472]">
                      {c.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 py-16 md:py-20">
          <h2 className="text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            From clicking host to first drop.
          </h2>
          <div className="mt-10 flex flex-col">
            {STEPS.map((s) => (
              <motion.div
                key={s.n}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-t border-[#0c0f14]/10 py-7 sm:grid-cols-[auto_220px_1fr] sm:gap-8"
              >
                <span className="font-mono text-[13px] font-bold text-[#9aa3b0]">{s.n}</span>
                <h3 className="text-[19px] font-semibold tracking-tight">{s.title}</h3>
                <p className="col-span-2 mt-1 max-w-[68ch] text-[14.5px] leading-relaxed text-[#5a6472] sm:col-span-1 sm:mt-0">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* security */}
        <section id="security" className="scroll-mt-20 border-t border-[#0c0f14]/12 bg-[#f7f8fa]">
          <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <h2 className="max-w-[16ch] text-balance text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                  The security model, in four lines.
                </h2>
                <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[#5a6472]">
                  No marketing language here. These are the actual constraints the
                  server is built around.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-px bg-[#0c0f14]/10 sm:grid-cols-2">
                {SECURITY.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
                    className="bg-white p-6"
                  >
                    <h3 className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-proto-accent">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#5a6472]">{s.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* final cta */}
        <section className="mx-auto max-w-[760px] px-6 py-24 text-center md:py-28">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-balance text-[clamp(30px,4.6vw,50px)] font-semibold leading-[1.03] tracking-[-0.03em]"
          >
            Set up your first room. It takes about a minute.
          </motion.h2>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="mt-9"
          >
            <ProtoCtas mode="light" radius="sharp" />
          </motion.div>
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 font-mono text-[11.5px] tracking-[0.06em] text-[#9aa3b0]"
          >
            Free. 5 GB per room. Your Drive, your rules.
          </motion.p>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-[#0c0f14]/12">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center bg-proto-accent text-[8px] font-black text-white">
                G_
              </span>
              <span className="text-[13px] font-semibold tracking-tight">G_Cloister</span>
            </div>
            <p className="mt-2 max-w-[36ch] text-[12.5px] leading-relaxed text-[#9aa3b0]">
              Private, real-time file rooms stored on the host's own Google Drive.
              MIT licensed.
            </p>
          </div>
          <div className="flex gap-12 text-[13px]">
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#9aa3b0]">
                Product
              </span>
              <Link href="/home" className="text-[#5a6472] transition-colors hover:text-[#0c0f14]">
                Rooms
              </Link>
              <Link href="/host" className="text-[#5a6472] transition-colors hover:text-[#0c0f14]">
                Host a room
              </Link>
              <Link href="/join" className="text-[#5a6472] transition-colors hover:text-[#0c0f14]">
                Join with a code
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#9aa3b0]">
                Legal
              </span>
              <a
                href="https://github.com/qwyuvanyt8-commits/G_Cloister/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a6472] transition-colors hover:text-[#0c0f14]"
              >
                License
              </a>
              <a
                href="https://github.com/qwyuvanyt8-commits/G_Cloister"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a6472] transition-colors hover:text-[#0c0f14]"
              >
                GitHub source
              </a>
            </div>
          </div>
        </div>
      </footer>

      <ProtoSwitcher />
    </div>
  );
}