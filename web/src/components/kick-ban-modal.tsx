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
            className="relative z-10 w-full max-w-md overflow-hidden border-4 border-gc-orange bg-paper p-7 shadow-[8px_8px_0_#16130d]"
          >
            <div className="flex h-12 w-12 items-center justify-center border-2 border-gc-orange bg-gc-orange/10 text-gc-orange">
              <ShieldWarning size={28} />
            </div>

            <h3 className="mt-4 text-xl font-black tracking-tight uppercase">
              Account Banned by Administrator
            </h3>

            <p className="mt-2 text-[14px] leading-relaxed text-gc-muted">
              {bannedReason || "Your account has been banned by an administrator."}
            </p>

            <div className="mt-4 border-2 border-gc-orange bg-gc-orange/10 p-3.5 text-[12.5px] leading-snug text-gc-orange">
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
            className="relative z-10 w-full max-w-md overflow-hidden border-4 border-gc-ink bg-paper p-7 shadow-[8px_8px_0_#16130d]"
          >
            <div className="flex h-12 w-12 items-center justify-center border-2 border-gc-ink bg-gc-mint text-gc-ink">
              <Door size={28} />
            </div>

            <h3 className="mt-4 text-xl font-black tracking-tight uppercase">
              You Have Been Kicked
            </h3>

            <div className="mt-3 border-2 border-dashed border-gc-ink bg-paper-2 p-4 text-[13.5px]">
              <div className="flex justify-between border-b-2 border-dashed border-gc-ink/40 pb-2 font-space-mono text-[11px] uppercase tracking-[0.06em] text-gc-muted">
                <span>Room ID</span>
                <span className="font-space-mono font-bold text-gc-ink">{kickInfo.roomId}</span>
              </div>
              <div className="flex justify-between pt-2 font-space-mono text-[11px] uppercase tracking-[0.06em] text-gc-muted">
                <span>Kicked By</span>
                <span className="font-medium text-ink">
                  {kickInfo.kickerName} {kickInfo.isHostKicker ? "(Room Owner)" : "(Administrator)"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-gc-muted">
              {kickInfo.isHostKicker ? (
                <>
                  You have been kicked from room <span className="font-space-mono font-bold text-gc-ink">{kickInfo.roomId}</span> by the room owner (<span className="font-medium text-ink">{kickInfo.kickerName}</span>).
                </>
              ) : (
                <>
                  You have been kicked from room <span className="font-space-mono font-bold text-gc-ink">{kickInfo.roomId}</span> by an <span className="font-medium text-ink">Administrator</span>.
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
