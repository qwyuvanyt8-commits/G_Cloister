"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, LockKey, Key } from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";

function JoinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

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
    <main className="min-h-[calc(100dvh-4rem)]">
      <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-[70vh]" aria-hidden />
      <div className="relative mx-auto max-w-xl px-5 pb-24 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">Join</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tighter text-ink">Step inside</h1>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted">
            A host shared a room ID and password with you. Enter them and the files start flowing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass mt-10 rounded-3xl p-6 sm:p-8"
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
              icon={<LockKey size={18} className="text-accent" />}
            />

            <Button size="lg" className="w-full" loading={joining} disabled={!valid} onClick={join} icon={!joining && <ArrowRight size={18} />}>
              Enter the room
            </Button>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
              <Key size={18} weight="duotone" className="shrink-0 text-accent" />
              <p className="text-[13px] leading-snug text-muted">
                No Google account needed — the room's storage lives on the host's Drive.
                Just enter the code and password to step inside.
              </p>
            </div>
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
