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
        className="flex items-center -space-x-2 border-2 border-gc-ink bg-paper p-0.5 shadow-[2px_2px_0_var(--gc-shadow)] transition-transform hover:scale-105 active:scale-95"
        aria-label="Room members"
      >
        {visible.map((m) => (
          <Avatar key={m.id} name={m.name} src={m.avatar} size={30} online={m.left || m.kicked ? false : m.online} ring />
        ))}
        {overflow > 0 && (
          <span className="flex h-[30px] w-[30px] items-center justify-center border-2 border-gc-ink bg-paper-2 font-space-mono text-[11px] font-bold text-gc-muted ring-2 ring-paper">
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
              className="absolute right-0 top-12 z-50 w-80 border-4 border-gc-ink bg-paper p-3 shadow-[6px_6px_0_var(--gc-shadow)]"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-gc-ink/40 px-1 pb-2.5 mb-2">
                <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                  Members <span className="text-gc-faint">({members.length})</span>
                </p>
                <span className="font-space-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-gc-cobalt">
                  {onlineCount} online
                </span>
              </div>
              <ul className="flex max-h-80 flex-col gap-1 overflow-auto">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 border-2 border-transparent px-2.5 py-2 transition-colors hover:border-dashed hover:border-gc-ink/40 hover:bg-paper-2">
                    <Avatar name={m.name} src={m.avatar} size={32} online={m.left || m.kicked ? false : m.online} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <p className="truncate text-[13px] font-bold text-gc-ink">{m.name}</p>
                        {m.role === "host" ? (
                          <span className="flex shrink-0 items-center gap-0.5 border border-gc-ink bg-gc-cobalt px-1.5 py-0.5 font-space-mono text-[9px] font-bold uppercase tracking-[0.06em] text-paper">
                            <Crown size={9} weight="fill" />
                            Host
                          </span>
                        ) : (
                          <span className="shrink-0 border border-gc-ink bg-paper-2 px-1.5 py-0.5 font-space-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-muted">
                            Member
                          </span>
                        )}
                        {m.kicked ? (
                          <span className="shrink-0 border border-gc-ink bg-gc-orange px-1.5 py-0.5 font-space-mono text-[9px] font-bold uppercase tracking-[0.06em] text-paper">
                            Kicked
                          </span>
                        ) : m.left ? (
                          <span className="shrink-0 border border-gc-ink bg-gc-orange/70 px-1.5 py-0.5 font-space-mono text-[9px] font-bold uppercase tracking-[0.06em] text-paper">
                            Left
                          </span>
                        ) : !m.online ? (
                          <span className="shrink-0 border border-gc-ink bg-paper-2 px-1.5 py-0.5 font-space-mono text-[9px] font-bold uppercase tracking-[0.06em] text-gc-faint">
                            Offline
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate font-space-mono text-[10px] text-gc-faint">{m.email}</p>
                    </div>

                    {isHost && m.role !== "host" && (
                      <button
                        type="button"
                        onClick={() => handleToggleKick(m)}
                        disabled={actingId === m.id}
                        className={cn(
                          "shrink-0 border-2 px-2 py-1 font-space-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors disabled:opacity-50",
                          m.kicked
                            ? "border-gc-ink bg-gc-cobalt text-paper hover:bg-gc-cobalt-dark"
                            : "border-gc-ink bg-gc-orange text-paper hover:bg-gc-orange-dark"
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
