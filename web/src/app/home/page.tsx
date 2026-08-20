"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  PlusCircle,
  SignIn,
  ArrowRight,
  GoogleLogo,
  Crown,
  Users,
  HardDrive,
  FolderOpen,
  TrashSimple,
  X,
  Sparkle,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

interface RoomCard {
  roomId: string;
  createdAt: number;
  usedBytes: number;
  usedFormatted: string;
  limitFormatted: string;
  memberCount: number;
  hostName?: string;
  hostAvatar?: string | null;
  isMember?: boolean;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function RoomCardItem({
  room,
  isHosted,
  delay,
  onDeleted,
}: {
  room: RoomCard;
  isHosted: boolean;
  delay: number;
  onDeleted: (roomId: string, isHosted: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      if (isHosted) {
        await api.deleteRoom(room.roomId);
        toast(`Room /${room.roomId} deleted.`);
      } else {
        await api.forgetRoom(room.roomId);
        toast(`Room /${room.roomId} removed from your list.`);
      }
      onDeleted(room.roomId, isHosted);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not remove room.", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-white/10 bg-[#12151c] p-5 text-left transition-all duration-150 hover:-translate-y-1 hover:border-gc-cobalt/60 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)]"
    >
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#12151c] p-5 text-center"
          >
            <X size={22} weight="bold" className="text-gc-orange" />
            <p className="mt-2 text-[13.5px] font-extrabold tracking-tight text-gc-ink">
              {isHosted ? `Delete /${room.roomId}?` : `Remove /${room.roomId}?`}
            </p>
            <p className="mt-0.5 max-w-[90%] font-mono text-[11.5px] leading-tight text-gc-muted">
              {isHosted
                ? "This permanently deletes the room for all members."
                : "Remove this room from your joined list."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                }}
                disabled={deleting}
                className="h-9 rounded-full border border-white/15 px-3 font-mono text-[11px] font-bold uppercase text-gc-muted transition-colors hover:text-gc-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 rounded-full bg-gc-orange px-3.5 font-mono text-[11px] font-bold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "…" : isHosted ? "Delete room" : "Remove"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[16px] font-black tracking-tight",
              isHosted
                ? "bg-gc-cobalt text-white"
                : "border border-white/10 bg-white/[0.04] text-[#7c8bff]"
            )}
          >
            {room.roomId[0]?.toUpperCase() || "G_"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-mono text-[15px] font-bold tracking-tight text-gc-ink">
              /{room.roomId}
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-gc-faint">
              {isHosted ? "room you host" : "room you joined"}
            </span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          {isHosted ? (
            <span className="flex items-center gap-1 rounded-full border border-gc-cobalt/40 bg-gc-cobalt/10 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#7c8bff]">
              <Crown size={10} weight="fill" />
              {room.isMember === false ? "Host · Left" : "Host"}
            </span>
          ) : room.isMember === false ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-gc-muted">
              Left
            </span>
          ) : null}
          <button
            type="button"
            aria-label="Delete room"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gc-faint transition-colors hover:bg-gc-orange/15 hover:text-gc-orange"
          >
            <TrashSimple size={14} />
          </button>
        </div>
      </div>

      {!isHosted && room.hostName && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-gc-muted">
          hosted by <span className="font-bold text-gc-ink">{room.hostName.split(" ")[0]}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] tabular-nums tracking-[0.04em] text-gc-faint">
        <span className="flex items-center gap-1.5">
          <Users size={13} weight="fill" className="text-[#565e6b]" /> {room.memberCount}
        </span>
        <span className="flex items-center gap-1.5">
          <HardDrive size={13} weight="fill" className="text-[#565e6b]" /> {room.usedFormatted} /{" "}
          {room.limitFormatted}
        </span>
        <span className="ml-auto">{timeAgo(room.createdAt)}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-gc-faint">
        <span>Room {room.roomId[0]?.toUpperCase() || "G"}</span>
        <span className="font-bold tracking-[0.24em] text-gc-muted">G_ · {room.roomId.slice(0, 4)}</span>
      </div>
    </motion.div>
  );
}

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [hosted, setHosted] = useState<RoomCard[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("gcl_my_hosted");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [joined, setJoined] = useState<RoomCard[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("gcl_my_joined");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = params.get("auth");
    if (auth === "success") toast("Signed in. Welcome back.");
    else if (auth === "error") toast("Sign-in didn't complete. Please try again.", "error");
  }, [params, toast]);

  const loadRooms = useCallback(async () => {
    try {
      const data = await api.myRooms();
      setHosted(data.hosted);
      setJoined(data.joined);
      try {
        localStorage.setItem("gcl_my_hosted", JSON.stringify(data.hosted));
        localStorage.setItem("gcl_my_joined", JSON.stringify(data.joined));
      } catch {}
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoomDeleted = useCallback((roomId: string, isHosted: boolean) => {
    if (isHosted) {
      setHosted((prev) => {
        const next = prev.filter((r) => r.roomId !== roomId);
        try { localStorage.setItem("gcl_my_hosted", JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setJoined((prev) => {
        const next = prev.filter((r) => r.roomId !== roomId);
        try { localStorage.setItem("gcl_my_joined", JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const hasRooms = hosted.length > 0 || joined.length > 0;

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-12 lg:pt-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(32px,4.6vw,56px)] font-black leading-[0.95] tracking-[-0.04em]">
            What will you open{" "}
            <span className="inline-block -rotate-1 rounded-lg bg-gc-cobalt px-[0.1em] text-white">
              today
            </span>
            <span className="text-[#7c8bff]">?</span>
          </h1>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Host */}
          <motion.button
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            onClick={() => router.push("/host")}
            className="group rounded-2xl border border-white/10 bg-[#12151c] p-7 text-left transition-colors duration-150 hover:border-gc-cobalt/60 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gc-cobalt text-white shadow-[0_6px_20px_-6px_rgba(68,86,232,0.7)]">
                <PlusCircle size={24} weight="bold" />
              </span>
              <span className="rounded-full border border-gc-cobalt/40 bg-gc-cobalt/10 px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7c8bff]">
                step 01
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight">Host a room</h2>
            <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-gc-muted">
              Pick a room ID. Your Google Drive becomes the vault with a fresh 5&nbsp;GB to fill.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#7c8bff] transition-transform duration-200 group-hover:translate-x-1">
              Create a room <ArrowRight size={14} weight="bold" />
            </span>
          </motion.button>

          {/* Join */}
          <motion.button
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            onClick={() => router.push("/join")}
            className="group rounded-2xl border border-white/10 bg-[#12151c] p-7 text-left transition-colors duration-150 hover:border-[#7c8bff]/50 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#7c8bff]">
                <SignIn size={24} weight="bold" />
              </span>
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-gc-muted">
                step 02
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight">Join a room</h2>
            <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-gc-muted">
              Got a code and a password from a host? Step inside and see their files appear live.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gc-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#7c8bff]">
              Enter with a code <ArrowRight size={14} weight="bold" />
            </span>
          </motion.button>
        </div>

        {/* Skeleton while first load */}
        {loading && hosted.length === 0 && joined.length === 0 && (
          <div className="mt-14 space-y-6" aria-hidden>
            <div className="h-6 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-32 animate-pulse rounded-2xl bg-white/[0.05]" />
              <div className="h-32 animate-pulse rounded-2xl bg-white/[0.05]" />
            </div>
          </div>
        )}

        {/* My Hosted Rooms */}
        {hosted.length > 0 && (
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mt-14"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gc-cobalt text-white">
                  <Crown size={15} weight="fill" />
                </span>
                <h2 className="text-xl font-black tracking-tight">Your rooms</h2>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-faint">
                ({hosted.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hosted.map((r, i) => (
                <RoomCardItem
                  key={r.roomId}
                  room={r}
                  isHosted
                  delay={i * 0.04}
                  onDeleted={handleRoomDeleted}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Joined Rooms */}
        {joined.length > 0 && (
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-14"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-[#7c8bff]">
                  <FolderOpen size={15} weight="duotone" />
                </span>
                <h2 className="text-xl font-black tracking-tight">Joined rooms</h2>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-faint">
                ({joined.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {joined.map((r, i) => (
                <RoomCardItem
                  key={r.roomId}
                  room={r}
                  isHosted={false}
                  delay={i * 0.04}
                  onDeleted={handleRoomDeleted}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {!loading && !hasRooms && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-14 flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#12151c] text-[#7c8bff]">
              <Sparkle size={30} weight="duotone" />
            </span>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-gc-muted">
              No rooms yet. Host one or join with a code to get started.
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gc-faint">
              your drive is empty, your first room is one click away
            </p>
          </motion.div>
        )}

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-gc-muted"
        >
          <GoogleLogo size={14} />
          All rooms run on your own Google Drive — nothing is hosted on third-party servers.
        </motion.p>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <AppNav />
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
    </RequireAuth>
  );
}