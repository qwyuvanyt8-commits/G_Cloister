"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  Copy,
  Check,
  DotsThree,
  HardDrives,
  LockKey,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button, Input, MonoChip } from "@/components/ui";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";

const WORDS = [
  "vault", "atrium", "quarry", "cipher", "haven", "loft", "obelisk", "reef",
  "spire", "tide", "vista", "willow", "cedar", "ember", "frost", "grove",
];

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function randomPassword() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
}

function randomRoomId() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${word}-${Math.floor(100 + Math.random() * 900)}`;
}

function HostInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState(() => randomPassword());
  const [copied, setCopied] = useState<"id" | "pw" | "all" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ roomId: string; password: string } | null>(null);

  const validation = useMemo(() => {
    const v = roomId.trim().toLowerCase();
    if (!v) return { ok: true, hint: "3–20 characters · letters, numbers, - and _", error: null };
    if (!/^[a-z0-9][a-z0-9-_]{2,19}$/.test(v)) {
      return { ok: false, hint: null, error: "Use 3–20 characters: letters, numbers, '-' or '_'." };
    }
    return { ok: true, hint: null, error: null };
  }, [roomId]);

  const copy = async (text: string, which: "id" | "pw" | "all") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  const create = async () => {
    if (!validation.ok) return;
    setError(null);
    setCreating(true);
    try {
      const room = await api.createRoom(roomId.trim().toLowerCase());
      setCreated({ roomId: room.roomId, password: room.password });
      toast("Room created. Your vault is ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the room.");
    } finally {
      setCreating(false);
    }
  };

  if (created) {
    const inviteUrl = `${window.location.origin}/join?room=${created.roomId}&pw=${encodeURIComponent(created.password)}`;
    return (
      <main className="min-h-[calc(100dvh-4rem)]">
        <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-[70vh]" aria-hidden />
        <div className="relative mx-auto max-w-xl px-5 pb-24 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-[#04120c]">
              <Check size={30} weight="bold" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tighter text-ink">Room created</h1>
            <p className="mt-2 text-[15px] text-muted">
              Your vault is live at <span className="font-mono text-accent">G_Cloister/{created.roomId}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass mt-8 rounded-3xl p-6"
          >
            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-faint">Room ID</p>
                <div className="mt-2 flex items-center gap-2">
                  <MonoChip className="flex-1 justify-between px-3 py-2.5 text-[15px]">
                    {created.roomId}
                  </MonoChip>
                  <Button size="sm" variant="secondary" icon={copied === "id" ? <Check size={15} /> : <Copy size={15} />} onClick={() => copy(created.roomId, "id")}>
                    {copied === "id" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-faint">Password</p>
                <div className="mt-2 flex items-center gap-2">
                  <MonoChip className="flex-1 justify-between px-3 py-2.5 text-[15px] tracking-[0.18em]">
                    <span className="flex items-center gap-2"><LockKey size={15} className="text-accent" />{created.password}</span>
                  </MonoChip>
                  <Button size="sm" variant="secondary" icon={copied === "pw" ? <Check size={15} /> : <Copy size={15} />} onClick={() => copy(created.password, "pw")}>
                    {copied === "pw" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 text-[12.5px] text-faint">This is the only time the password is shown in full.</p>
              </div>

              <Button
                className="w-full"
                icon={copied === "all" ? <Check size={18} /> : <Copy size={18} />}
                variant="secondary"
                onClick={() => copy(inviteUrl, "all")}
              >
                {copied === "all" ? "Invite link copied" : "Copy invite link"}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(`/room/${created.roomId}`)}
              icon={<ArrowRight size={18} />}
            >
              Open your room
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-[70vh]" aria-hidden />
      <div className="relative mx-auto max-w-xl px-5 pb-24 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">Host</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tighter text-ink">Claim a room name</h1>
          <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted">
            Pick an ID people will remember. We'll cut a <span className="font-mono text-accent">G_Cloister</span> folder into your Drive and hand you a password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass mt-10 rounded-3xl p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6">
            <Input
              label="Room ID"
              name="roomId"
              autoComplete="off"
              mono
              autoFocus
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="vault-alpha"
              hint={validation.hint || undefined}
              error={validation.error || error || undefined}
              trailing={
                <button
                  type="button"
                  onClick={() => setRoomId(randomRoomId())}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-muted transition-colors hover:text-accent"
                  aria-label="Suggest a room ID"
                >
                  <DotsThree size={18} weight="bold" /> suggest
                </button>
              }
            />

            <div>
              <p className="text-[13px] font-medium text-muted">Room password</p>
              <div className="mt-2 flex items-center gap-2">
                <MonoChip className="flex-1 justify-between px-3 py-2.5 text-[15px] tracking-[0.18em]">
                  <span className="flex items-center gap-2"><LockKey size={15} className="text-accent" />{password}</span>
                </MonoChip>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={copied === "pw" ? <Check size={15} /> : <Copy size={15} />}
                  onClick={() => copy(password, "pw")}
                  aria-label="Copy password"
                >
                  {copied === "pw" ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPassword(randomPassword())}
                  aria-label="Regenerate password"
                >
                  <DotsThree size={18} weight="bold" />
                </Button>
              </div>
              <p className="mt-2 text-[12.5px] text-faint">
                Auto-generated. You can keep it or regenerate until you're happy.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              loading={creating}
              disabled={!validation.ok}
              onClick={create}
              icon={!creating && <ArrowRight size={18} />}
            >
              Create the room
            </Button>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
              <HardDrives size={18} weight="duotone" className="shrink-0 text-accent" />
              <p className="text-[13px] leading-snug text-muted">
                <span className="font-medium text-ink">5 GB</span> of fresh space will be carved out of{" "}
                <span className="font-medium text-ink">your Google Drive</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function HostPage() {
  return (
    <RequireAuth>
      <AppNav backTo="/home" />
      <HostInner />
    </RequireAuth>
  );
}
