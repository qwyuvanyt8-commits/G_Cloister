"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import type { RoomMember } from "@/lib/types";
import { Avatar } from "@/components/ui";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/cn";

export function MembersStack({
  members,
  isHost,
  roomId,
}: {
  members: RoomMember[];
  isHost?: boolean;
  roomId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const { toast } = useToast();

  const visible = members.slice(0, 4);
  const overflow = members.length - visible.length;
  const onlineCount = members.filter((m) => m.online && !m.left && !m.kicked).length;

  const handleToggleKick = async (targetMember: RoomMember) => {
    if (!roomId) return;
    setActingId(targetMember.id);
    try {
      if (targetMember.kicked) {
        await api.unkickMember(roomId, targetMember.id);
        toast(`Unkicked ${targetMember.name.split(" ")[0]}.`);
      } else {
        await api.kickMember(roomId, targetMember.id);
        toast(`Kicked ${targetMember.name.split(" ")[0]} & purged their Drive files.`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Action failed.", "error");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-2xl border border-white/10 bg-[#12151c] p-1.5 transition-all hover:border-gc-cobalt/50 active:scale-95"
        aria-label="Room members"
      >
        {visible.map((m) => (
          <Avatar key={m.id} name={m.name} src={m.avatar} size={28} online={m.left || m.kicked ? false : m.online} ring />
        ))}
        {overflow > 0 && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[11px] font-bold text-gc-muted ring-2 ring-[#12151c]">
            +{overflow}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
              aria-label="Close members"
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-[#12151c] p-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]"
            >
              <div className="mb-2 flex items-center justify-between border-b border-white/10 px-1 pb-2.5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                  Members <span className="text-gc-faint">({members.length})</span>
                </p>
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#7c8bff]">
                  {onlineCount} online
                </span>
              </div>
              <ul className="flex max-h-80 flex-col gap-1 overflow-auto">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.04]"
                  >
                    <Avatar name={m.name} src={m.avatar} size={32} online={m.left || m.kicked ? false : m.online} />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <p className="truncate text-[13px] font-bold text-gc-ink">{m.name}</p>
                        {m.role === "host" ? (
                          <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-gc-cobalt/40 bg-gc-cobalt/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-[#7c8bff]">
                            <Crown size={9} weight="fill" />
                            Host
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-muted">
                            Member
                          </span>
                        )}
                        {m.kicked ? (
                          <span className="shrink-0 rounded-full border border-gc-orange/40 bg-gc-orange/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-orange">
                            Kicked
                          </span>
                        ) : m.left ? (
                          <span className="shrink-0 rounded-full border border-gc-orange/30 bg-gc-orange/[0.07] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-orange">
                            Left
                          </span>
                        ) : !m.online ? (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-faint">
                            Offline
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate font-mono text-[10px] text-gc-faint">{m.email}</p>
                    </div>

                    {isHost && m.role !== "host" && (
                      <button
                        type="button"
                        onClick={() => handleToggleKick(m)}
                        disabled={actingId === m.id}
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors disabled:opacity-50",
                          m.kicked
                            ? "border border-gc-cobalt/40 bg-gc-cobalt/15 text-[#7c8bff] hover:bg-gc-cobalt/25"
                            : "border border-gc-orange/40 bg-gc-orange/10 text-gc-orange hover:bg-gc-orange/20"
                        )}
                      >
                        {actingId === m.id ? "…" : m.kicked ? "Unkick" : "Kick"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}