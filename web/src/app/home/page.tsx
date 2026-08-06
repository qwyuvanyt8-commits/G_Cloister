"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  PlusCircle,
  SignIn,
  ArrowRight,
  GoogleLogo,
  Crown,
  Users,
  HardDrive,
  FolderOpen,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui";
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
}: {
  room: RoomCard;
  isHosted: boolean;
  delay: number;
}) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-border hover:shadow-lg hover:shadow-accent/5 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[15px] font-semibold tracking-tight text-ink">
          /{room.roomId}
        </span>
        {isHosted && (
          <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
            <Crown size={11} weight="fill" />
            {room.isMember === false ? "Host (Left)" : "Host"}
          </span>
        )}
      </div>

      {!isHosted && room.hostName && (
        <p className="text-[12px] text-muted">
          hosted by {room.hostName.split(" ")[0]}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[12px] text-faint">
        <span className="flex items-center gap-1">
          <Users size={13} /> {room.memberCount}
        </span>
        <span className="flex items-center gap-1">
          <HardDrive size={13} /> {room.usedFormatted} / {room.limitFormatted}
        </span>
        <span className="ml-auto">{timeAgo(room.createdAt)}</span>
      </div>

      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-accent/0 transition-all duration-300 group-hover:ring-accent/20" />
    </motion.button>
  );
}

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [hosted, setHosted] = useState<RoomCard[]>([]);
  const [joined, setJoined] = useState<RoomCard[]>([]);
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
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const hasRooms = hosted.length > 0 || joined.length > 0;

  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-[80vh]" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-16 lg:px-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            What will you open <span className="text-accent">today</span>?
          </h1>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Host */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/host")}
            className="group relative overflow-hidden rounded-3xl border border-accent-border bg-accent-soft p-8 text-left transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-[#04120c]">
              <PlusCircle size={24} weight="bold" />
            </span>
            <h2 className="relative mt-6 text-2xl font-semibold tracking-tight text-ink">Host a room</h2>
            <p className="relative mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              Pick a room ID. Your Google Drive becomes the vault with a fresh 5&nbsp;GB to fill.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Create a room <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          {/* Join */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/join")}
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 text-left transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink ring-1 ring-border">
              <SignIn size={24} weight="duotone" />
            </span>
            <h2 className="relative mt-6 text-2xl font-semibold tracking-tight text-ink">Join a room</h2>
            <p className="relative mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              Got a code and a password from a host? Step inside and see their files appear live.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors group-hover:text-accent">
              Enter with a code <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        </div>

        {/* My Hosted Rooms */}
        {!loading && hosted.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Crown size={16} weight="fill" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Your Rooms</h2>
              <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-faint">
                {hosted.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hosted.map((r, i) => (
                <RoomCardItem key={r.roomId} room={r} isHosted delay={0.26 + i * 0.04} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Joined Rooms */}
        {!loading && joined.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <FolderOpen size={16} weight="duotone" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Joined Rooms</h2>
              <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-faint">
                {joined.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {joined.map((r, i) => (
                <RoomCardItem key={r.roomId} room={r} isHosted={false} delay={0.34 + i * 0.04} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {!loading && !hasRooms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-14 flex flex-col items-center text-center"
          >
            <FolderOpen size={32} weight="duotone" className="text-faint" />
            <p className="mt-3 text-[14px] text-muted">
              No rooms yet. Host one or join with a code to get started.
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex items-center gap-2 text-[13px] text-faint"
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
