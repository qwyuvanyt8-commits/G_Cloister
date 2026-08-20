"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, LockKey, Key, ArrowDownLeft } from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";

const EASE = [0.16, 1, 0.3, 1] as const;

function JoinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const room = params.get("room");
    const pw = params.get("pw");
    if (room) setRoomId(room);
    if (pw) setPassword(pw);
    if (room && !pw) toast("Paste the password from your host to step inside.", "info");
  }, [params, toast]);

  const valid = useMemo(
    () => roomId.trim().length >= 3 && password.length >= 1,
    [roomId, password]
  );

  const join = async () => {
    if (!valid) return;
    setError(null);
    setJoining(true);
    try {
      await api.joinRoom(roomId.trim().toLowerCase(), password);
      toast("You're in. Welcome to the room.");
      router.push(`/room/${roomId.trim().toLowerCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the room.");
      setJoining(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
            Join
          </p>
          <h1 className="mt-4 text-[clamp(28px,4.5vw,44px)] font-black leading-[0.95] tracking-[-0.04em]">
            Step{" "}
            <span className="-rotate-1 rounded-lg bg-gc-cobalt px-[0.08em] text-white">inside</span>
          </h1>
          <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-gc-muted">
            A host shared a room ID and password with you. Enter them and the files start flowing.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: EASE }}
          className="mt-10 rounded-2xl border border-white/10 bg-[#12151c] p-6 sm:p-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              join();
            }}
            className="flex flex-col gap-6"
          >
            <Input
              label="Room ID"
              name="roomId"
              autoComplete="off"
              mono
              autoFocus
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="vault-alpha"
              hint="Ask the host if you don't have it."
              error={error || undefined}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="off"
              mono
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="kP#7x2Qm"
              icon={<LockKey size={18} className="text-[#7c8bff]" />}
            />

            <Button
              size="lg"
              className="w-full"
              loading={joining}
              disabled={!valid}
              onClick={join}
              icon={!joining && <ArrowRight size={18} />}
            >
              Enter the room
            </Button>

            <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gc-cobalt/10 text-[#7c8bff]">
                <Key size={17} weight="duotone" />
              </span>
              <p className="font-mono text-[11px] leading-snug uppercase tracking-[0.06em] text-gc-muted">
                No Google account needed — the room&apos;s storage lives on the host&apos;s Drive. Just
                enter the code and password to step inside.
              </p>
            </div>

            <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-gc-faint">
              <ArrowDownLeft size={11} />
              came from a link? the room and password are already filled in above
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <RequireAuth>
      <AppNav backTo="/home" />
      <Suspense fallback={null}>
        <JoinInner />
      </Suspense>
    </RequireAuth>
  );
}