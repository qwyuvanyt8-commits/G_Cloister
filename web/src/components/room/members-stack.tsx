"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, UserMinus, UserPlus } from "@phosphor-icons/react";
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
        className="flex items-center -space-x-2 rounded-full p-0.5 transition-transform hover:scale-105 active:scale-95"
        aria-label="Room members"
      >
        {visible.map((m) => (
          <Avatar key={m.id} name={m.name} src={m.avatar} size={30} online={m.left || m.kicked ? false : m.online} ring />
        ))}
        {overflow > 0 && (
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted ring-2 ring-surface">
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
              className="glass-solid absolute right-0 top-12 z-50 w-80 rounded-2xl p-2 shadow-xl border border-border"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 mb-1">
                <p className="text-[13px] font-semibold text-ink">
                  Members <span className="font-mono text-[11px] text-faint">({members.length})</span>
                </p>
                <span className="font-mono text-[11px] text-accent font-medium">
                  {onlineCount} online
                </span>
              </div>
              <ul className="flex max-h-80 flex-col gap-0.5 overflow-auto">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-surface-2">
                    <Avatar name={m.name} src={m.avatar} size={32} online={m.left || m.kicked ? false : m.online} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">{m.name}</p>
                        {m.role === "host" ? (
                          <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            <Crown size={10} weight="fill" />
                            Host
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                            Member
                          </span>
                        )}
                        {m.kicked ? (
                          <span className="shrink-0 rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                            Kicked
                          </span>
                        ) : m.left ? (
                          <span className="shrink-0 rounded-full bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                            Left
                          </span>
                        ) : !m.online ? (
                          <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-faint">
                            Offline
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-[11px] text-faint">{m.email}</p>
                    </div>

                    {isHost && m.role !== "host" && (
                      <button
                        type="button"
                        onClick={() => handleToggleKick(m)}
                        disabled={actingId === m.id}
                        className={cn(
                          "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50",
                          m.kicked
                            ? "bg-accent-soft text-accent hover:bg-accent/20"
                            : "bg-danger-soft text-danger hover:bg-danger/20"
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
