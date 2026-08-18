"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { AuthModal } from "@/components/auth-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/cn";

const MARQUEE_ITEMS = [
  "CELL-04",
  "PDF",
  "SCRIPTORIUM",
  "MOV",
  "GARTH",
  "PNG",
  "ATRIUM",
  "ZIP",
  "REFECTORY",
  "FIG",
  "PARLOR",
  "RAW",
  "ORCHARD-9",
  "MP3",
  "CLOISTER",
];

const ROOM_CARDS = [
  {
    glyph: "📎",
    tone: "cobalt" as const,
    name: "CELL-04",
    status: "OPEN",
    statusTone: "text-gc-orange" as const,
    host: "host priya",
    meta: "3 members · 2.1 GB",
    chips: ["PDF", "MOV", "PNG"],
    zip: "••••••",
  },
  {
    glyph: "🎬",
    tone: "orange" as const,
    name: "SCRIPTORIUM",
    status: "OPEN",
    statusTone: "text-gc-orange" as const,
    host: "host daniel",
    meta: "6 members · 4.0 GB",
    chips: ["FIG", "MP4", "DWG"],
    zip: "••••••",
  },
  {
    glyph: "🌿",
    tone: "mint" as const,
    name: "GARTH",
    status: "OPEN",
    statusTone: "text-gc-orange" as const,
    host: "host leo",
    meta: "1 member · 300 MB",
    chips: ["XLSX", "PDF"],
    zip: "••••••",
  },
  {
    glyph: "▣",
    tone: "ink" as const,
    name: "ATRIUM",
    status: "EMPTY",
    statusTone: "text-gc-mint" as const,
    host: "awaiting host",
    meta: "0 members",
    chips: [],
    zip: "———",
  },
  {
    glyph: "📁",
    tone: "cobalt" as const,
    name: "REFECTORY",
    status: "OPEN",
    statusTone: "text-gc-orange" as const,
    host: "host ana",
    meta: "4 members · 1.8 GB",
    chips: ["PSD", "ZIP", "AUD"],
    zip: "••••••",
  },
];

const CARD_TONES: Record<string, string> = {
  cobalt: "bg-gc-cobalt text-paper",
  orange: "bg-gc-orange text-paper",
  mint: "bg-gc-mint text-gc-ink-solid",
  ink: "bg-gc-ink text-paper",
};

const RULES = [
  {
    num: "RULE 01",
    title: "REAL TIME",
    body: "Files land on every screen the moment they drop. Live presence, live storage, live kicks.",
    variant: "cobalt" as const,
  },
  {
    num: "RULE 02",
    title: "YOUR DRIVE",
    body: "Storage carved from the host's Google Drive. The app only sees what it creates.",
    variant: "mint" as const,
  },
  {
    num: "RULE 03",
    title: "LOCKED DOORS",
    body: "Code + password per room. bcrypt hashes, AES-256-GCM at rest, 15-minute previews.",
    variant: "plain" as const,
  },
  {
    num: "RULE 04",
    title: "NO CLOUD BILL",
    body: "Free to host. 5 GB a room. No storage to buy, ever — you already own the drive.",
    variant: "plain" as const,
  },
];

const STEPS = [
  { move: "MOV 1", title: "HOST — PEEL ONE", body: "Sign in with Google, pick a room ID, set a password. A G_Cloister folder is carved in your Drive." },
  { move: "MOV 2", title: "PASS — HAND IT OVER", body: "Send the room ID and password. A chat message, an email, a sticky note — one code, one door." },
  { move: "MOV 3", title: "DROP — FILL IT", body: "Everyone drops up to 5 GB. Files stream to every member at once — and to the host's Drive." },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [showAuth, setShowAuth] = useState(false);

  const start = () => {
    if (user) router.push("/home");
    else setShowAuth(true);
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const btnBase =
    "inline-flex items-center justify-center gap-2.5 border-3 border-gc-ink font-extrabold text-[15px] leading-none tracking-tight transition-all duration-150 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-gc-cobalt disabled:opacity-50";

  return (
    <main className="min-h-screen overflow-x-clip bg-paper font-archivo text-gc-ink">
      {/* ---------- top ticker ---------- */}
      <div className="bg-gc-ink text-paper">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-2.5 font-space-mono text-[10.5px] uppercase tracking-[0.12em]">
          <span>
            <span className="text-gc-mint dark:text-[#2f9e63]">✓</span> NO STORAGE BILLS — EVER
          </span>
          <span className="hidden md:inline text-gc-orange">● REAL-TIME SYNC ●</span>
          <span className="hidden sm:inline">YOUR DRIVE · YOUR RULES</span>
        </div>
      </div>

      {/* ---------- masthead ---------- */}
      <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 border-b-4 border-gc-ink px-6 py-4">
        <Link href="/" className="inline-flex items-center text-xl font-black leading-none tracking-tight" aria-label="G_Cloister home">
          <span className="bg-gc-cobalt px-2.5 py-1.5 text-paper">G_</span>
          <span className="border-3 border-gc-ink px-2.5 py-1.5">CLOISTER</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {[
            ["ROOMS", "collect"],
            ["RULES", "rules"],
            ["FINE PRINT", "print"],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="font-space-mono text-xs uppercase tracking-[0.08em] text-gc-muted transition-colors hover:text-gc-ink hover:underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-gc-cobalt"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={start}
            className={cn(
              "bg-gc-orange px-4 py-2.5 font-extrabold text-[13px] leading-none text-paper transition-all duration-150 hover:bg-gc-orange-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--gc-shadow)]",
              "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-gc-cobalt"
            )}
          >
            {loading ? "…" : user ? "GO TO ROOMS" : "HOST A ROOM"}
          </button>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-6 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div>
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-space-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gc-cobalt"
          >
            Sticker sheet / collectible rooms
          </motion.span>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            className="mt-5 font-black leading-[0.9] tracking-[-0.045em] text-[clamp(46px,6.4vw,84px)] text-balance"
          >
            STICK THE ROOM.
            <br />
            <span className="inline-block -rotate-1 bg-gc-cobalt px-[0.14em] text-paper">
              EVERYWHERE
            </span>
            <span className="text-gc-orange">.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-[44ch] text-[16.5px] leading-relaxed text-gc-muted"
          >
            Every room is a card you can peel and pass along — a code on the back,
            a door on the front. Host on your Drive, hand the sticker to your people,
            and drop files together in real time.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <button onClick={start} className={cn(btnBase, "bg-gc-orange px-7 py-4 text-paper hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-gc-orange-dark hover:shadow-[4px_4px_0_var(--gc-shadow)]")}>
              {user && !loading ? (
                <>
                  GO TO ROOMS <ArrowRight size={16} weight="bold" />
                </>
              ) : (
                "HOST A ROOM"
              )}
            </button>
            <button
              onClick={start}
              className={cn(btnBase, "border-gc-ink bg-gc-ink px-7 py-4 text-paper hover:border-gc-cobalt hover:bg-gc-cobalt")}
            >
              JOIN WITH A CODE
            </button>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-5 font-space-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-muted"
          >
            Hosts sign in with Google · Members join with an email · Free
          </motion.p>
        </div>

        {/* sticker sheet */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 34, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
          className="relative border-4 border-gc-ink bg-paper-2 p-5 shadow-[10px_10px_0_var(--gc-shadow)]"
        >
          <div
            aria-hidden
            className="absolute -right-4 -top-5 z-10 grid h-[86px] w-[68px] rotate-12 place-items-center border-3 border-gc-ink bg-paper text-[28px] font-black text-gc-cobalt shadow-[5px_5px_0_var(--gc-shadow)]"
          >
            G_
          </div>
          <p className="mb-4 text-center font-space-mono text-[9.5px] uppercase tracking-[0.18em] text-gc-muted">
            Sticker sheet — Scriptorium 001
          </p>
          <div className="grid grid-cols-3 gap-3.5">
            {[
              { g: "◐", tone: "bg-gc-cobalt text-paper", lid: "ROOM WS-01", nm: "CELL-04" },
              { g: "▣", tone: "bg-gc-orange text-paper -rotate-2", lid: "ROOM WS-02", nm: "GARTH" },
              { g: "▤", tone: "bg-gc-mint text-gc-ink-solid", lid: "ROOM WS-03", nm: "ATRIUM" },
            ].map((s) => (
              <div
                key={s.nm}
                className={cn(
                  "relative flex aspect-[4/5] flex-col justify-end rounded-[14px] border-2 border-dashed border-gc-ink p-3 transition-transform duration-200 hover:-translate-y-1",
                  s.tone
                )}
              >
                <span className="absolute left-3 top-3 text-[24px]">{s.g}</span>
                <span className="font-space-mono text-[9px] uppercase tracking-[0.14em] opacity-75">{s.lid}</span>
                <span className="mt-0.5 text-[15px] font-black tracking-tight">{s.nm}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between font-space-mono text-[9.5px] uppercase tracking-[0.16em] text-gc-muted">
            <span>Peel + pass</span>
            <span>One code · one door</span>
          </div>
        </motion.div>
      </section>

      {/* ---------- marquee ---------- */}
      <div aria-hidden className="overflow-hidden border-y-4 border-gc-ink bg-gc-ink py-3.5 text-paper">
        <div className="marquee-track flex w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-5 pr-5 font-space-mono text-xs uppercase tracking-[0.16em] whitespace-nowrap">
              {item}
              <span className="text-gc-orange">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- collection ---------- */}
      <section id="collect" className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b-4 border-gc-ink pb-4">
          <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-[clamp(30px,4.2vw,50px)]">
            THE{" "}
            <span className="inline-block bg-gc-cobalt px-[0.12em] text-paper">COLLECTION</span>
            <br />
            SO FAR.
          </h2>
          <span className="font-space-mono text-[11px] uppercase tracking-[0.12em] text-gc-muted">
            Rooms currently open
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROOM_CARDS.map((room, i) => (
            <motion.article
              key={room.name}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="group border-4 border-gc-ink bg-paper transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:rotate-[-0.6deg] hover:shadow-[7px_7px_0_var(--gc-shadow)]"
            >
              <div className={cn("grid h-[130px] place-items-center border-b-4 border-gc-ink text-[46px]", CARD_TONES[room.tone])}>
                <span aria-hidden>{room.glyph}</span>
              </div>
              <div className="px-4 pt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-black tracking-tight">{room.name}</span>
                  <span className={cn("font-space-mono text-[9.5px] uppercase tracking-[0.12em]", room.statusTone)}>
                    ● {room.status}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between font-space-mono text-[10.5px] text-gc-muted">
                  <span>{room.host}</span>
                  <span>{room.meta}</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {room.chips.length ? (
                    room.chips.map((c) => (
                      <span key={c} className="rounded-full border-[1.5px] border-gc-ink px-2 py-0.5 font-space-mono text-[9px] tracking-[0.06em] text-gc-muted">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="font-space-mono text-[9px] text-gc-faint">— · — · —</span>
                  )}
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t-2 border-dashed border-gc-ink px-4 py-2 font-space-mono text-[9px] uppercase tracking-[0.14em] text-gc-faint">
                <span>TEAR HERE</span>
                <span className="font-bold tracking-[0.22em] text-gc-ink">{room.zip}</span>
              </div>
            </motion.article>
          ))}

          {/* next room card */}
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="border-4 border-dashed border-gc-ink bg-paper-2 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--gc-shadow)]"
          >
            <button onClick={start} className="block w-full text-left">
              <div className="grid h-[130px] place-items-center border-b-4 border-dashed border-gc-ink bg-paper-2 text-[46px] text-gc-faint">
                <span aria-hidden>+</span>
              </div>
              <div className="px-4 pt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-black tracking-tight">YOURS?</span>
                  <span className="font-space-mono text-[9.5px] uppercase tracking-[0.12em] text-gc-cobalt">NEW</span>
                </div>
                <div className="mt-1.5 font-space-mono text-[10.5px] text-gc-muted">
                  <span>you</span> · <span>0 members · 5 GB</span>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t-2 border-dashed border-gc-ink px-4 py-2 font-space-mono text-[9px] uppercase tracking-[0.14em] text-gc-faint">
                <span>HOST THE NEXT ONE</span>
                <span className="font-bold text-gc-cobalt">✦</span>
              </div>
            </button>
          </motion.article>
        </div>
      </section>

      {/* ---------- rules ---------- */}
      <section id="rules" className="border-t-4 border-gc-ink bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b-4 border-gc-ink pb-4">
            <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-[clamp(30px,4.2vw,50px)]">
              THE RULES
              <br />
              OF THE SHEET.
            </h2>
            <span className="font-space-mono text-[11px] uppercase tracking-[0.12em] text-gc-muted">
              Printed on the liner
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map((rule, i) => (
              <motion.div
                key={rule.num}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className={cn(
                  "rounded-2xl border-2 p-5 transition-transform duration-200 hover:-rotate-1",
                  rule.variant === "cobalt" && "border-gc-ink bg-gc-cobalt text-paper",
                  rule.variant === "mint" && "border-gc-ink bg-gc-mint text-gc-ink-solid",
                  rule.variant === "plain" && "border-dashed border-gc-ink bg-paper"
                )}
              >
                <span className="font-space-mono text-[11px] font-bold text-gc-orange">{rule.num}</span>
                <h3 className="mt-2.5 text-lg font-black tracking-tight">{rule.title}</h3>
                <p className={cn("mt-2 text-[13.5px] leading-relaxed", rule.variant === "cobalt" ? "text-paper/85" : rule.variant === "mint" ? "text-gc-ink-solid/70" : "text-gc-muted")}>
                  {rule.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how to play ---------- */}
      <section id="how" className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b-4 border-gc-ink pb-4">
          <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-[clamp(30px,4.2vw,50px)]">HOW TO PLAY.</h2>
          <span className="font-space-mono text-[11px] uppercase tracking-[0.12em] text-gc-muted">
            Three moves · one key
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.move}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              className="relative border-4 border-gc-ink bg-paper p-5 pt-6"
            >
              <span className="absolute -top-3.5 left-4 border-2 border-gc-ink bg-gc-orange px-2.5 py-1 font-space-mono text-[10.5px] font-bold uppercase text-paper">
                {step.move}
              </span>
              <h3 className="mt-2 text-lg font-black tracking-tight">{step.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-gc-muted">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- fine print ---------- */}
      <section id="print" className="mx-auto max-w-[860px] px-6 py-16 md:py-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="-rotate-1 rounded-[18px] border-2 border-dashed border-gc-ink bg-gc-mint px-8 py-10 text-center text-gc-ink-solid"
        >
          <h2 className="font-black leading-[0.94] tracking-[-0.04em] text-[clamp(30px,4.4vw,54px)] text-balance">
            FINE PRINT:
            <br />
            FILES LIVE IN THE HOST&apos;S DRIVE.
            <br />
            <span className="inline-block bg-gc-cobalt px-[0.12em] text-paper">WE CAN&apos;T SEE THEM.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-gc-ink-solid/75">
            No rented cloud space, no scanning of uploads, no selling of data. Revoke
            Drive access and the vault is gone. That&apos;s the whole privacy policy.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="mt-8 flex justify-end"
        >
          <a
            href="https://github.com/qwyuvanyt8-commits/G_Cloister"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rotate-1 items-center gap-2.5 border-2 border-gc-ink bg-paper px-4 py-3 shadow-[3px_3px_0_var(--gc-shadow)] transition-all duration-150 hover:-rotate-1 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--gc-shadow)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gc-cobalt"
            aria-label="G_Cloister source on GitHub"
          >
            <GithubLogo size={20} weight="fill" className="text-gc-ink" />
            <span className="font-space-mono text-[11px] font-bold uppercase tracking-[0.12em]">
              Source · GitHub
            </span>
          </a>
        </motion.div>
      </section>

      {/* ---------- final cta ---------- */}
      <section id="final" className="border-t-4 border-gc-ink py-20 text-center md:py-24">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-black leading-[0.86] tracking-[-0.05em] text-[clamp(50px,8vw,108px)]"
        >
          OPEN A
          <br />
          <span className="inline-block bg-gc-cobalt px-[0.12em] text-paper">PACK</span>
          <span className="text-gc-orange">.</span>
        </motion.h2>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button onClick={start} className={cn(btnBase, "bg-gc-orange px-7 py-4 text-paper hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-gc-orange-dark hover:shadow-[4px_4px_0_var(--gc-shadow)]")}>
            HOST A ROOM WITH GOOGLE
          </button>
          <button onClick={start} className={cn(btnBase, "bg-gc-ink px-7 py-4 text-paper hover:border-gc-cobalt hover:bg-gc-cobalt")}>
            JOIN WITH A CODE
          </button>
        </motion.div>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 font-space-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-muted"
        >
          Free · 5 GB per room · Your Drive · Your rules
        </motion.p>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t-4 border-gc-ink">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 py-5 font-space-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-muted sm:flex-row">
          <span>G_CLOISTER © {new Date().getFullYear()}</span>
          <span>BUILT ON THE GOOGLE DRIVE API</span>
          <span>YOUR DRIVE · YOUR RULES</span>
        </div>
      </footer>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}
