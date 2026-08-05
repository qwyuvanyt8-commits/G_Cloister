"use client";

import { motion } from "motion/react";
import type { RoomUsage } from "@/lib/types";

export function UsageBar({ usage }: { usage: RoomUsage }) {
  const pct = usage.percent;
  const danger = pct >= 90;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-muted">Room storage</span>
        <span className="font-mono text-[12px] tabular-nums text-muted">
          <span className={danger ? "text-danger" : "text-ink"}>{usage.usedFormatted}</span>
          {" / "}
          {usage.limitFormatted}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className={danger ? "h-full rounded-full bg-danger" : "h-full rounded-full bg-accent"}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        />
      </div>
    </div>
  );
}
