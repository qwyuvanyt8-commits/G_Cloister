"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";

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
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group relative flex cursor-pointer flex-col gap-3 border-4 border-gc-ink bg-paper p-4 text-left shadow-[5px_5px_0_var(--gc-shadow)] transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--gc-shadow)] active:scale-[0.99]"
    >
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper p-4 text-center border-4 border-gc-ink shadow-[6px_6px_0_var(--gc-shadow)]"
          >
            <span className="text-2xl text-gc-orange">✕</span>
            <p className="mt-2 text-[13.5px] font-extrabold uppercase tracking-tight text-gc-ink">
              {isHosted ? `DELETE /${room.roomId}?` : `REMOVE /${room.roomId}?`}
            </p>
            <p className="mt-0.5 max-w-[90%] text-[11.5px] font-space-mono text-gc-muted leading-tight">
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
                className="h-8 border-2 border-gc-ink bg-paper-2 px-2.5 font-space-mono text-[11px] font-bold uppercase text-gc-muted transition-colors hover:text-gc-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-8 border-2 border-gc-ink bg-gc-orange px-3 font-space-mono text-[11px] font-bold uppercase text-paper shadow-[2px_2px_0_var(--gc-shadow)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "…" : isHosted ? "Delete Room" : "Remove"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-space-mono text-[16px] font-bold tracking-tight text-gc-ink">
          /{room.roomId}
        </span>
        <div className="flex items-center gap-2">
          {isHosted ? (
            <span className="flex items-center gap-1 border-2 border-gc-ink bg-gc-cobalt px-1.5 py-0.5 font-space-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-paper">
              <Crown size={10} weight="fill" />
              {room.isMember === false ? "Host · Left" : "Host"}
            </span>
          ) : room.isMember === false ? (
            <span className="border-2 border-gc-ink bg-paper-2 px-1.5 py-0.5 font-space-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-gc-muted">
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
            className="relative z-10 flex h-8 w-8 items-center justify-center border-2 border-transparent text-gc-faint transition-all hover:border-gc-ink hover:bg-gc-orange hover:text-paper"
          >
            <TrashSimple size={14} />
          </button>
        </div>
      </div>

      {!isHosted && room.hostName && (
        <p className="font-space-mono text-[11px] uppercase tracking-[0.08em] text-gc-muted">
          hosted by {room.hostName.split(" ")[0]}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 font-space-mono text-[11px] uppercase tracking-[0.04em] text-gc-faint">
        <span className="flex items-center gap-1">
          <Users size={13} weight="fill" /> {room.memberCount}
        </span>
        <span className="flex items-center gap-1">
          <HardDrive size={13} weight="fill" /> {room.usedFormatted} / {room.limitFormatted}
        </span>
        <span className="ml-auto">{timeAgo(room.createdAt)}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-gc-ink pt-2.5 font-space-mono text-[9px] uppercase tracking-[0.14em] text-gc-faint">
        <span>tear here</span>
        <span className="font-bold tracking-[0.22em] text-gc-ink">G_ · {room.roomId.slice(0, 4)}</span>
      </div>
    </motion.div>
  );
}

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

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
    <main className="min-h-[calc(100dvh-4rem)] bg-paper text-gc-ink">
      <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gc-cobalt">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(34px,5vw,58px)] font-black leading-[0.95] tracking-[-0.03em]">
            What will you open{" "}
            <span className="inline-block bg-gc-cobalt px-[0.12em] text-paper">
              today
            </span>
            <span className="text-gc-orange">?</span>
          </h1>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Host */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/host")}
            className="group relative border-4 border-gc-ink bg-paper p-7 text-left shadow-[7px_7px_0_var(--gc-shadow)] transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--gc-shadow)] active:scale-[0.99]"
          >
            <span className="absolute right-4 top-4 border-2 border-gc-ink bg-gc-mint px-1.5 py-0.5 font-space-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-gc-ink">
              step 01
            </span>
            <span className="flex h-12 w-12 items-center justify-center border-2 border-gc-ink bg-gc-cobalt text-paper shadow-[3px_3px_0_var(--gc-shadow)]">
              <PlusCircle size={24} weight="bold" />
            </span>
            <h2 className="mt-6 text-2xl font-black tracking-tight">Host a room</h2>
            <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-gc-muted">
              Pick a room ID. Your Google Drive becomes the vault with a fresh 5&nbsp;GB to fill.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-space-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-cobalt transition-transform group-hover:translate-x-1">
              Create a room <ArrowRight size={14} weight="bold" />
            </span>
          </motion.button>

          {/* Join */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/join")}
            className="group relative border-4 border-gc-ink bg-paper p-7 text-left shadow-[7px_7px_0_var(--gc-shadow)] transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_var(--gc-shadow)] active:scale-[0.99]"
          >
            <span className="absolute right-4 top-4 border-2 border-gc-ink bg-gc-orange px-1.5 py-0.5 font-space-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-paper">
              step 02
            </span>
            <span className="flex h-12 w-12 items-center justify-center border-2 border-gc-ink bg-gc-orange text-paper shadow-[3px_3px_0_var(--gc-shadow)]">
              <SignIn size={24} weight="bold" />
            </span>
            <h2 className="mt-6 text-2xl font-black tracking-tight">Join a room</h2>
            <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-gc-muted">
              Got a code and a password from a host? Step inside and see their files appear live.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-space-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-muted transition-colors group-hover:text-gc-orange">
              Enter with a code <ArrowRight size={14} weight="bold" />
            </span>
          </motion.button>
        </div>

        {/* Skeleton while first load */}
        {loading && hosted.length === 0 && joined.length === 0 && (
          <div className="mt-14 space-y-6 animate-pulse">
            <div className="h-6 w-32 border-2 border-dashed border-gc-ink bg-paper-2" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-28 border-4 border-dashed border-gc-ink bg-paper-2/60" />
              <div className="h-28 border-4 border-dashed border-gc-ink bg-paper-2/60" />
            </div>
          </div>
        )}

        {/* My Hosted Rooms */}
        {hosted.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b-4 border-gc-ink pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border-2 border-gc-ink bg-gc-cobalt text-paper">
                  <Crown size={15} weight="fill" />
                </span>
                <h2 className="text-xl font-black tracking-tight">Your rooms</h2>
              </div>
              <span className="font-space-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gc-faint">
                ({hosted.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b-4 border-gc-ink pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border-2 border-gc-ink bg-gc-orange text-paper">
                  <FolderOpen size={15} weight="duotone" />
                </span>
                <h2 className="text-xl font-black tracking-tight">Joined rooms</h2>
              </div>
              <span className="font-space-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gc-faint">
                ({joined.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-14 flex flex-col items-center border-4 border-dashed border-gc-ink bg-paper-2 px-6 py-16 text-center"
          >
            <span className="text-3xl text-gc-faint">✦</span>
            <p className="mt-3 font-space-mono text-[12px] uppercase tracking-[0.12em] text-gc-muted">
              No rooms yet. Host one or join with a code to get started.
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex items-center gap-2 font-space-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-muted"
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
