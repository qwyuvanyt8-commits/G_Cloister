"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LockKey, Check, FileImage, FilePdf, FileVideo, FileArchive } from "@phosphor-icons/react";
import { Avatar, MonoChip } from "@/components/ui";
import { cn } from "@/lib/cn";

const fakeFiles = [
  { name: "brand-guidelines.pdf", icon: FilePdf, tone: "text-danger", size: "4.2 MB", by: "Nina" },
  { name: "launch-photos.zip", icon: FileArchive, tone: "text-[#f0b04e]", size: "812 MB", by: "You" },
  { name: "site-hero.png", icon: FileImage, tone: "text-accent", size: "2.1 MB", by: "Omar" },
  { name: "walkthrough.mp4", icon: FileVideo, tone: "text-[#5aa2ff]", size: "1.9 GB", by: "Nina" },
];

export function RoomPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, reduce ? 0 : -40]);
  const chipY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -24, reduce ? 0 : 24]);

  return (
    <motion.div ref={ref} style={{ y }} className={cn("relative", className)}>
      {/* Glow behind */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(50%_50%_at_50%_50%,var(--accent-soft),transparent_70%)] blur-2xl"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="glass relative w-full max-w-[400px] rounded-3xl p-5"
        style={{ transformPerspective: 1200 }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f0b04e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          </div>
          <MonoChip>vault-alpha</MonoChip>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            live
          </span>
        </div>

        {/* Usage */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-medium text-muted">Room storage</span>
            <span className="font-mono text-[12px] text-muted">
              <span className="text-ink">2.9</span> GB / 5.0 GB
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "58%" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />
          </div>
        </div>

        {/* Files */}
        <ul className="mt-4 flex flex-col gap-1.5">
          {fakeFiles.map((f, i) => (
            <motion.li
              key={f.name}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
                <f.icon size={16} weight="duotone" className={f.tone} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{f.name}</p>
                <p className="text-[11px] text-faint">
                  {f.size} · by {f.by}
                </p>
              </div>
              <Check size={15} className="text-accent" />
            </motion.li>
          ))}
        </ul>

        {/* Members */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
          <div className="flex -space-x-2">
            {["NL", "OM", "JK"].map((ini, i) => (
              <span
                key={ini}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-surface",
                  i === 0 && "bg-accent-soft text-accent",
                  i === 1 && "bg-[#5aa2ff]/20 text-[#5aa2ff]",
                  i === 2 && "bg-[#b78cff]/20 text-[#b78cff]"
                )}
              >
                {ini}
              </span>
            ))}
          </div>
          <span className="text-[12px] text-muted">Synced in real time</span>
        </div>
      </motion.div>

      {/* Floating chips */}
      <motion.div
        style={{ y: chipY }}
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-3 -top-6 sm:-right-10"
      >
        <MonoChip className="gap-2 border-accent-border bg-surface py-2 pr-3.5 shadow-[0_18px_40px_-18px_var(--accent-border)]">
          <LockKey size={15} className="text-accent" weight="bold" />
          <span className="tracking-wider">kP#7x2Qm</span>
        </MonoChip>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-5 -left-3 sm:-left-10"
      >
        <div className="glass flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
            <Check size={13} weight="bold" className="text-[#04120c]" />
          </span>
          <span className="text-[12px] font-medium text-ink">New file synced</span>
        </div>
      </motion.div>

      {/* Ambient avatar chip */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.25, duration: 0.5 }}
        className="absolute -right-4 bottom-14 hidden sm:block"
      >
        <div className="flex -space-x-2.5 rounded-full border border-border bg-surface p-1.5">
          <Avatar name="Nina L" size={26} />
          <Avatar name="Omar M" size={26} />
        </div>
      </motion.div>
    </motion.div>
  );
}
