"use client";

import { motion } from "motion/react";
import type { RoomUsage } from "@/lib/types";

export function UsageBar({ usage }: { usage: RoomUsage }) {
  const pct = usage.percent;
  const danger = pct >= 90;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-space-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gc-muted">
          Room storage
        </span>
        <span className="font-space-mono text-[12px] tabular-nums tracking-[0.04em] text-gc-muted">
          <span className={danger ? "font-bold text-gc-orange" : "font-bold text-gc-ink"}>{usage.usedFormatted}</span>
          {" / "}
          {usage.limitFormatted}
        </span>
      </div>
      <div className="mt-1.5 h-3 border-2 border-gc-ink bg-paper-2">
        <motion.div
          className={danger ? "h-full bg-gc-orange" : "h-full bg-gc-cobalt"}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        />
      </div>
    </div>
  );
}
