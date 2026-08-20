"use client";

import { motion, AnimatePresence } from "motion/react";
import { ShieldWarning, Door, ArrowRight, SignOut } from "@phosphor-icons/react";
import { Button } from "./ui";

export interface KickInfo {
  roomId: string;
  kickerName: string;
  isHostKicker: boolean;
}

export function KickBanModal({
  bannedReason,
  kickInfo,
  onDismissBan,
  onDismissKick,
}: {
  bannedReason: string | null;
  kickInfo: KickInfo | null;
  onDismissBan: () => void;
  onDismissKick: () => void;
}) {
  const isBannedOpen = !!bannedReason;
  const isKickOpen = !isBannedOpen && !!kickInfo;

  return (
    <AnimatePresence>
      {/* ---- Account Banned Modal ---- */}
      {isBannedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-gc-orange/40 bg-[#10131a] p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gc-orange/30 bg-gc-orange/10 text-gc-orange">
              <ShieldWarning size={28} />
            </div>

            <h3 className="mt-4 text-xl font-black tracking-tight">Account Banned</h3>

            <p className="mt-2 text-[14px] leading-relaxed text-gc-muted">
              {bannedReason || "Your account has been banned by an administrator."}
            </p>

            <div className="mt-4 rounded-xl border border-gc-orange/30 bg-gc-orange/10 p-3.5 text-[12.5px] leading-snug text-gc-orange">
              Your active sessions and WebSocket connections have been terminated immediately. Access to hosted and joined rooms is suspended.
            </div>

            <div className="mt-6">
              <Button
                size="lg"
                variant="danger"
                className="w-full"
                onClick={onDismissBan}
                icon={<SignOut size={17} />}
              >
                Acknowledge &amp; Exit
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---- Kicked from Room Modal ---- */}
      {isKickOpen && kickInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#10131a] p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gc-cobalt/15 text-[#7c8bff]">
              <Door size={28} />
            </div>

            <h3 className="mt-4 text-xl font-black tracking-tight">You&apos;ve been kicked</h3>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[13.5px]">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-gc-muted">
                <span>Room ID</span>
                <span className="font-bold text-gc-ink">{kickInfo.roomId}</span>
              </div>
              <div className="flex justify-between gap-4 pt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-gc-muted">
                <span>Kicked by</span>
                <span className="text-gc-ink">
                  {kickInfo.kickerName} {kickInfo.isHostKicker ? "(Room owner)" : "(Administrator)"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-gc-muted">
              {kickInfo.isHostKicker ? (
                <>
                  The room owner (<span className="font-mono font-bold text-gc-ink">{kickInfo.kickerName}</span>) removed you from{" "}
                  <span className="font-mono font-bold text-gc-ink">{kickInfo.roomId}</span>.
                </>
              ) : (
                <>
                  An administrator removed you from{" "}
                  <span className="font-mono font-bold text-gc-ink">{kickInfo.roomId}</span>.
                </>
              )}
            </p>

            <div className="mt-6">
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={onDismissKick}
                icon={<ArrowRight size={17} />}
              >
                Acknowledge &amp; Return to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}