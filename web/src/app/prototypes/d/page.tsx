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

const CELLS = [
  {
    title: "Storage",
    body: "A dedicated folder inside the host's Google Drive. The app only sees what it creates.",
    tag: "drive.file",
    tile: "cobalt" as const,
  },
  {
    title: "Live sync",
    body: "Uploads, renames, deletes and presence stream to every open screen instantly.",
    tag: "socket.io",
    tile: "plain" as const,
  },
  {
    title: "Control",
    body: "Kick, cap and purge from one panel. The host stays in charge end to end.",
    tag: "host panel",
    tile: "plain" as const,
  },
  {
    title: "Guard",
    body: "bcrypt codes, AES-256-GCM tokens and 15-minute self-revoking preview links.",
    tag: "aes-256-gcm",
    tile: "grid" as const,
  },
];

const FACTS = [
  { value: "5 GB", label: "per room, free" },
  { value: "Real time", label: "no refresh needed" },
  { value: "2 ciphers", label: "bcrypt + AES-256-GCM" },
];

export default function PrototypeDPage() {
  const reduce = useReducedMotion();
  const { start, hostLabel } = useProtoStart();

  return (
    <div
      className="bg-[#0a0c11] text-[#f2f4f8] antialiased"
      style={{ "--proto-accent": "#5a6cff", "--proto-accent-strong": "#4456e8" } as CSSProperties}
    >
      {/* nav */}
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="G_Cloister home">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-proto-accent text-[11px] font-black text-white">
              G_
            </span>
            <span className="text-[16px] font-bold tracking-tight">G_Cloister</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] text-[#96a0b0] md:flex">
            {[
              ["Capabilities", "capabilities"],
              ["Security", "security"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition-colors hover:text-[#f2f4f8]">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#96a0b0] transition-colors hover:border-white/40 hover:text-white"
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
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7c8bff]"
            >
              Private file rooms
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              className="mt-6 font-medium leading-[0.95] tracking-[-0.045em] text-[clamp(46px,6.6vw,84px)]"
            >
              Private rooms.
              <br />
              Stored on{" "}
              <span className="text-[#7c8bff]">your drive.</span>
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              className="mt-7 max-w-[44ch] text-[16.5px] leading-relaxed text-[#96a0b0]"
            >
              Password-locked rooms that stream every upload in real time.
              The host's Google Drive does all the storing.
            </motion.p>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
              className="mt-10"
            >
              <ProtoCtas mode="dark" />
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          >
            <RoomPreview tone="dark" />
            <p className="mt-4 px-1 font-mono text-[11px] tracking-wide text-[#5a6472]">
              scriptorium-204 - four members, storing on the host's Drive.
            </p>
          </motion.div>
        </section>

        {/* facts strip */}
        <section className="border-y border-white/8 bg-white/[0.02]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 divide-y divide-white/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {FACTS.map((f, i) => (
              <motion.div
                key={f.value}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className="px-8 py-10"
              >
                <p className="font-mono text-[30px] font-semibold tracking-tight text-[#f2f4f8]">
                  {f.value}
                </p>
                <p className="mt-1.5 text-[13.5px] text-[#96a0b0]">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* capabilities - sparse cells */}
        <section id="capabilities" className="mx-auto max-w-[1240px] scroll-mt-20 px-6 py-24 md:py-32">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="max-w-[18ch] text-balance text-[clamp(30px,4vw,48px)] font-medium leading-[1.0] tracking-[-0.035em]">
              Built like a good room.
            </h2>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-[#5a6472] md:block">
              Capabilities
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {CELLS.map((c, i) => (
              <motion.article
                key={c.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: (i % 2) * 0.06, ease: EASE }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/8 p-8 transition-colors duration-200 hover:border-white/20",
                  c.tile === "cobalt" && "border-[#5a6cff]/40 bg-[#5a6cff]/[0.08]",
                  c.tile === "grid" &&
                    "bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:26px_26px]",
                  c.tile === "plain" && "bg-white/[0.025]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.18em]",
                      c.tile === "cobalt" ? "text-[#8fa0ff]" : "text-[#5a6472]"
                    )}
                  >
                    {c.tag}
                  </span>
                  <span className="text-[18px] text-[#5a6472] transition-colors duration-200 group-hover:text-proto-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-14 text-[clamp(26px,3.2vw,40px)] font-medium tracking-[-0.03em]">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-[#96a0b0]">
                  {c.body}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* security - quiet 2x2 */}
        <section id="security" className="scroll-mt-20 border-t border-white/8 bg-white/[0.02]">
          <div className="mx-auto max-w-[1240px] px-6 py-20 md:py-24">
            <h2 className="max-w-[20ch] text-balance text-[clamp(28px,3.6vw,44px)] font-medium leading-[1.02] tracking-[-0.03em]">
              The room stays yours.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
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
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                  className="bg-[#0d0f15] p-7"
                >
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c8bff]">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#96a0b0]">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* final cta */}
        <section className="mx-auto max-w-[860px] px-6 py-28 text-center md:py-36">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-balance font-medium leading-[0.96] tracking-[-0.045em] text-[clamp(40px,5.8vw,72px)]"
          >
            Open a room.
            <br />
            <span className="text-[#7c8bff]">Keep the files.</span>
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
            className="mt-7 font-mono text-[11.5px] tracking-[0.08em] text-[#5a6472]"
          >
            Free. 5 GB per room. Your Drive, your rules.
          </motion.p>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-6 py-7 md:flex-row">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#5a6472]">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-proto-accent text-[8px] font-black text-white">
              G_
            </span>
            G_Cloister © {new Date().getFullYear()}. MIT licensed.
          </span>
          <span className="font-mono text-[11px] tracking-wide text-[#5a6472]">
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