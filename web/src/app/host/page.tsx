"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Copy,
  Check,
  DotsThree,
  HardDrives,
  LockKey,
  Key,
  Hash,
  Sparkle,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/cn";

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

const EASE = [0.16, 1, 0.3, 1] as const;

function CredentialRow({
  label,
  icon,
  value,
  mono,
  copied,
  onCopy,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  mono: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gc-muted">
          {icon}
          {label}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#7c8bff] transition-colors hover:bg-gc-cobalt/10"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p
        className={cn(
          "mt-2 break-all font-mono text-[15px] font-bold tracking-tight text-gc-ink",
          mono && "tracking-[0.16em]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function HostInner() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasDrive, openDriveModal } = useAuth();
  const reduce = useReducedMotion();
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
      <main className="min-h-[calc(100dvh-4rem)] bg-[#0b0d12] text-gc-ink">
        <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center"
          >
            <motion.span
              initial={reduce ? false : { scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gc-cobalt text-white shadow-[0_10px_36px_-10px_rgba(68,86,232,0.9)]"
            >
              <Check size={30} weight="bold" />
            </motion.span>
            <h1 className="mt-6 text-[clamp(28px,4.5vw,44px)] font-black leading-[0.95] tracking-[-0.04em]">
              Room created
            </h1>
            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.1em] text-gc-muted">
              Your vault is live at <span className="font-bold text-[#7c8bff]">G_Cloister/{created.roomId}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-[#12151c] p-6"
          >
            <CredentialRow
              label="Room ID"
              icon={<Hash size={12} weight="bold" />}
              value={created.roomId}
              mono={false}
              copied={copied === "id"}
              onCopy={() => copy(created.roomId, "id")}
            />
            <CredentialRow
              label="Password"
              icon={<LockKey size={12} weight="bold" />}
              value={created.password}
              mono
              copied={copied === "pw"}
              onCopy={() => copy(created.password, "pw")}
            />
            <p className="flex items-center gap-1.5 pl-4 font-mono text-[10px] uppercase tracking-[0.1em] text-gc-faint">
              <Sparkle size={11} className="text-gc-orange" />
              This is the only time the password is shown in full.
            </p>

            <Button
              className="w-full"
              icon={copied === "all" ? <Check size={18} /> : <Copy size={18} />}
              variant="secondary"
              onClick={() => copy(inviteUrl, "all")}
            >
              {copied === "all" ? "Invite link copied" : "Copy invite link"}
            </Button>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
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
    <main className="min-h-[calc(100dvh-4rem)] bg-[#0b0d12] text-gc-ink">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-14">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c8bff]">
            Host
          </p>
          <h1 className="mt-4 text-[clamp(28px,4.5vw,44px)] font-black leading-[0.95] tracking-[-0.04em]">
            Claim a room name
          </h1>
          <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-gc-muted">
            Pick an ID people will remember. We&apos;ll cut a{" "}
            <span className="font-mono font-bold text-[#7c8bff]">G_Cloister</span> folder into your Drive and hand
            you a password.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: EASE }}
          className="mt-10 rounded-2xl border border-white/10 bg-[#12151c] p-6 sm:p-8"
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
                  className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-gc-muted transition-colors hover:text-[#7c8bff]"
                  aria-label="Suggest a room ID"
                >
                  <DotsThree size={18} weight="bold" /> suggest
                </button>
              }
            />

            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gc-muted">
                Room password
              </p>
              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 font-mono text-[15px] font-bold tracking-[0.16em] text-gc-ink">
                    <LockKey size={15} className="shrink-0 text-[#7c8bff]" />
                    {password}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copy(password, "pw")}
                      aria-label="Copy password"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7c8bff] transition-colors hover:bg-gc-cobalt/10"
                    >
                      {copied === "pw" ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword(randomPassword())}
                      aria-label="Regenerate password"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gc-muted transition-colors hover:bg-white/[0.06] hover:text-gc-ink"
                    >
                      <DotsThree size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 flex items-center gap-1.5 pl-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gc-faint">
                <Key size={11} className="text-gc-orange" />
                Auto-generated. Regenerate until you&apos;re happy.
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

            <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3">
              <HardDrives size={18} weight="duotone" className="shrink-0 text-gc-cobalt" />
              <p className="font-mono text-[11.5px] uppercase leading-snug tracking-[0.06em] text-gc-muted">
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