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
        <span className="flex items-center gap-1.5 font-space-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gc-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-gc-ink" />
          Room storage
        </span>
        <span className="font-space-mono text-[12px] tabular-nums tracking-[0.04em] text-gc-muted">
          <span className={danger ? "font-bold text-gc-orange" : "font-bold text-gc-ink"}>{usage.usedFormatted}</span>
          <span aria-hidden className="mx-1.5 text-gc-faint">/</span>
          <span>{usage.limitFormatted}</span>
        </span>
      </div>
      <div className="mt-1.5 h-3.5 border-2 border-gc-ink bg-paper-2 shadow-[2px_2px_0_var(--gc-shadow)]">
        <motion.div
          className={cn("relative h-full", danger ? "bg-gc-orange" : "bg-gc-cobalt")}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        >
          {!danger && pct > 12 && (
            <span aria-hidden className="absolute inset-y-0 left-0 w-full opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 6px, var(--gc-paper) 6px 8px)",
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}