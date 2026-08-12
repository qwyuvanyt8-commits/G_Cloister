"use client";

import { motion, AnimatePresence } from "motion/react";
import { ShieldWarning, Door, ArrowRight } from "@phosphor-icons/react";
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-danger/40 bg-surface p-7 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft text-danger">
              <ShieldWarning size={28} />
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
              Account Banned by Administrator
            </h3>

            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {bannedReason || "Your account has been banned by an administrator."}
            </p>

            <div className="mt-4 rounded-xl border border-danger/20 bg-danger-soft/40 p-3.5 text-[12.5px] leading-snug text-danger">
              Your active sessions and WebSocket connections have been terminated immediately. Access to hosted and joined rooms is suspended.
            </div>

            <div className="mt-6">
              <Button
                size="lg"
                variant="danger"
                className="w-full"
                onClick={onDismissBan}
                icon={<ArrowRight size={17} />}
              >
                Acknowledge & Exit
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-surface p-7 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Door size={28} />
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
              You Have Been Kicked
            </h3>

            <div className="mt-3 rounded-2xl border border-border bg-surface-2 p-4 text-[13.5px]">
              <div className="flex justify-between border-b border-border pb-2 text-[12px] text-muted">
                <span>Room ID</span>
                <span className="font-mono font-semibold text-ink">{kickInfo.roomId}</span>
              </div>
              <div className="flex justify-between pt-2 text-[12px] text-muted">
                <span>Kicked By</span>
                <span className="font-medium text-ink">
                  {kickInfo.kickerName} {kickInfo.isHostKicker ? "(Room Owner)" : "(Administrator)"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
              {kickInfo.isHostKicker ? (
                <>
                  You have been kicked from room <span className="font-mono font-semibold text-ink">{kickInfo.roomId}</span> by the room owner (<span className="font-medium text-ink">{kickInfo.kickerName}</span>).
                </>
              ) : (
                <>
                  You have been kicked from room <span className="font-mono font-semibold text-ink">{kickInfo.roomId}</span> by an <span className="font-medium text-ink">Administrator</span>.
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
                Acknowledge & Return to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
