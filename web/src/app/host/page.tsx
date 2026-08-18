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
import { useAuth } from "@/components/auth-provider";

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
  const { hasDrive, openDriveModal } = useAuth();
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

  const HOSTING_ERROR =
    "You can't create this room — you need to sign in through a Google account to host.";

  const openHostingDrivePrompt = () => {
    openDriveModal(
      "Google Account Required to Host",
      "Hosting stores room files in your own Google Drive, so it requires a Google account. You're signed in with email right now — switch to Google to unlock hosting."
    );
  };

  const create = async () => {
    if (!validation.ok) return;
    setError(null);
    if (!hasDrive) {
      setError(HOSTING_ERROR);
      openHostingDrivePrompt();
      return;
    }
    setCreating(true);
    try {
      const room = await api.createRoom(roomId.trim().toLowerCase());
      setCreated({ roomId: room.roomId, password: room.password });
      toast("Room created. Your vault is ready.");
    } catch (err: unknown) {
      const errObj = err as { code?: string; status?: number; message?: string };
      if (
        errObj?.code === "GOOGLE_REQUIRED" ||
        errObj?.code === "DRIVE_NO_TOKEN" ||
        errObj?.code === "DRIVE_AUTH" ||
        errObj?.status === 403
      ) {
        setError(HOSTING_ERROR);
        openHostingDrivePrompt();
      } else {
        setError(err instanceof Error ? err.message : "Could not create the room.");
      }
    } finally {
      setCreating(false);
    }
  };

  if (created) {
    const inviteUrl = `${window.location.origin}/join?room=${created.roomId}&pw=${encodeURIComponent(created.password)}`;
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-paper text-gc-ink">
        <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-gc-ink bg-gc-cobalt text-paper shadow-[3px_3px_0_#16130d]">
              <Check size={30} weight="bold" />
            </span>
            <h1 className="mt-6 font-black tracking-[-0.03em] text-[clamp(28px,4.5vw,44px)]">Room created</h1>
            <p className="mt-2 text-[15px] font-space-mono uppercase tracking-[0.08em] text-gc-muted">
              Your vault is live at <span className="text-gc-cobalt">G_Cloister/{created.roomId}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 border-4 border-gc-ink bg-paper p-6 shadow-[8px_8px_0_#16130d]"
          >
            <div className="space-y-5">
              <div>
                <p className="font-space-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gc-muted">Room ID</p>
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
                <p className="font-space-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gc-muted">Password</p>
                <div className="mt-2 flex items-center gap-2">
                  <MonoChip className="flex-1 justify-between px-3 py-2.5 text-[15px] tracking-[0.18em]">
                    <span className="flex items-center gap-2"><LockKey size={15} className="text-gc-cobalt" />{created.password}</span>
                  </MonoChip>
                  <Button size="sm" variant="secondary" icon={copied === "pw" ? <Check size={15} /> : <Copy size={15} />} onClick={() => copy(created.password, "pw")}>
                    {copied === "pw" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 font-space-mono text-[11px] uppercase tracking-[0.08em] text-gc-faint">This is the only time the password is shown in full.</p>
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
    <main className="min-h-[calc(100dvh-4rem)] bg-paper text-gc-ink">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gc-cobalt">Host</p>
          <h1 className="mt-4 font-black tracking-[-0.03em] text-[clamp(28px,4.5vw,44px)]">Claim a room name</h1>
          <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-gc-muted">
            Pick an ID people will remember. We&apos;ll cut a <span className="font-space-mono font-bold text-gc-cobalt">G_Cloister</span> folder into your Drive and hand you a password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 border-4 border-gc-ink bg-paper p-6 shadow-[8px_8px_0_#16130d] sm:p-8"
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
                  className="flex items-center gap-1 px-2 py-1 font-space-mono text-[11px] font-bold uppercase tracking-[0.08em] text-gc-muted transition-colors hover:text-gc-cobalt"
                  aria-label="Suggest a room ID"
                >
                  <DotsThree size={18} weight="bold" /> suggest
                </button>
              }
            />

            <div>
              <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.14em] text-gc-muted">Room password</p>
              <div className="mt-2 flex items-center gap-2">
                <MonoChip className="flex-1 justify-between px-3 py-2.5 text-[15px] tracking-[0.18em]">
                  <span className="flex items-center gap-2"><LockKey size={15} className="text-gc-cobalt" />{password}</span>
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
              <p className="mt-2 font-space-mono text-[11px] uppercase tracking-[0.08em] text-gc-faint">
                Auto-generated. You can keep it or regenerate until you&apos;re happy.
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

            <div className="flex items-center gap-3 border-2 border-dashed border-gc-ink bg-paper-2 px-4 py-3">
              <HardDrives size={18} weight="duotone" className="shrink-0 text-gc-cobalt" />
              <p className="font-space-mono text-[11.5px] leading-snug uppercase tracking-[0.06em] text-gc-muted">
                <span className="font-bold text-gc-ink">5 GB</span> of fresh space carved out of{" "}
                <span className="font-bold text-gc-ink">your Google Drive</span>.
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
