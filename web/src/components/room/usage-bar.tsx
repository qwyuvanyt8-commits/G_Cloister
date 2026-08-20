"use client";

import { motion } from "motion/react";
import type { RoomUsage } from "@/lib/types";
import { cn } from "@/lib/cn";

export function UsageBar({ usage }: { usage: RoomUsage }) {
  const pct = usage.percent;
  const danger = pct >= 90;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gc-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#7c8bff]" />
          Room storage
        </span>
        <span className="font-mono text-[12px] tabular-nums tracking-[0.04em] text-gc-muted">
          <span className={danger ? "font-bold text-gc-orange" : "font-bold text-gc-ink"}>{usage.usedFormatted}</span>
          <span aria-hidden className="mx-1.5 text-gc-faint">/</span>
          <span>{usage.limitFormatted}</span>
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("relative h-full rounded-full", danger ? "bg-gc-orange" : "bg-gc-cobalt")}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        >
          {!danger && pct > 12 && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-full rounded-full opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 8px, #fff 8px 10px)",
              }}
            />
          )}
        </motion.div>
      </div>
      {danger && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-gc-orange">
          Nearly full — delete some files to free space.
        </p>
      )}
    </div>
  );
}