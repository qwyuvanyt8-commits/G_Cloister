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
    <main className="min-h-[calc(100dvh-4rem)] bg-paper text-gc-ink">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gc-cobalt">Join</p>
          <h1 className="mt-4 font-black tracking-[-0.03em] text-[clamp(28px,4.5vw,44px)]">Step inside</h1>
          <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-gc-muted">
            A host shared a room ID and password with you. Enter them and the files start flowing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 border-4 border-gc-ink bg-paper p-6 shadow-[8px_8px_0_var(--gc-shadow)] sm:p-8"
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
              icon={<LockKey size={18} className="text-gc-cobalt" />}
            />

            <Button size="lg" className="w-full" loading={joining} disabled={!valid} onClick={join} icon={!joining && <ArrowRight size={18} />}>
              Enter the room
            </Button>

            <div className="flex items-center gap-3 border-2 border-dashed border-gc-ink bg-paper-2 px-4 py-3">
              <Key size={18} weight="duotone" className="shrink-0 text-gc-cobalt" />
              <p className="font-space-mono text-[11.5px] leading-snug uppercase tracking-[0.06em] text-gc-muted">
                No Google account needed — the room&apos;s storage lives on the host&apos;s Drive.
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
