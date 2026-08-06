"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  LinkSimple,
  WarningCircle,
  CaretRight,
  SpinnerGap,
  ArrowUUpLeft,
  XCircle,
  CheckCircle,
  SignOut,
  CloudArrowDown,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button, MonoChip } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { useRoomStore } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import { api, uploadFile, type UploadProgress } from "@/lib/api";
import { useToast } from "@/components/toast";
import { UploadDropzone } from "@/components/room/upload-dropzone";
import { UsageBar } from "@/components/room/usage-bar";
import { FileGrid } from "@/components/room/file-list";
import { PreviewModal } from "@/components/room/preview-modal";
import { MembersStack } from "@/components/room/members-stack";
import type { Room, RoomFile, RoomMember } from "@/lib/types";
import { cn } from "@/lib/cn";

interface UploadItem {
  key: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

function RoomInner() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId ?? "";
  const { user } = useAuth();
  const { toast } = useToast();

  const room = useRoomStore((s) => s.room);
  const connected = useRoomStore((s) => s.connected);
  const setRoom = useRoomStore((s) => s.setRoom);
  const addFile = useRoomStore((s) => s.addFile);
  const updateFile = useRoomStore((s) => s.updateFile);
  const removeFile = useRoomStore((s) => s.removeFile);
  const patchUsage = useRoomStore((s) => s.patchUsage);
  const setMembers = useRoomStore((s) => s.setMembers);
  const upsertMember = useRoomStore((s) => s.upsertMember);
  const removeMember = useRoomStore((s) => s.removeMember);
  const setMemberPresence = useRoomStore((s) => s.setMemberPresence);
  const setConnected = useRoomStore((s) => s.setConnected);
  const reset = useRoomStore((s) => s.reset);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound" | "member" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joinPw, setJoinPw] = useState("");
  const [joining, setJoining] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [previewFile, setPreviewFile] = useState<RoomFile | null>(null);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const loadRoom = useCallback(async () => {
    setLoadState("loading");
    try {
      const data: Room = await api.getRoom(roomId);
      setRoom(data);
      setLoadState("ready");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load room.";
      if (message.toLowerCase().includes("not found")) {
        setLoadState("notfound");
      } else if (
        message.toLowerCase().includes("not a member") ||
        message.toLowerCase().includes("403")
      ) {
        setLoadState("member");
      } else {
        setLoadState("error");
        setLoadError(message);
      }
    }
  }, [roomId, setRoom]);

  useEffect(() => {
    loadRoom();
    return () => reset();
  }, [loadRoom, reset]);

  /* Socket wiring */
  useEffect(() => {
    if (loadState !== "ready") return;

    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      if (user?.id) setMemberPresence(user.id, true);
      socket.emit("room:enter", { roomId });
    };
    const onDisconnect = () => setConnected(false);
    const onMemberPresence = ({ userId, online }: { userId: string; online: boolean }) =>
      setMemberPresence(userId, online);
    const onMembers = (members: RoomMember[]) => setMembers(members);
    const onMemberJoined = (m: RoomMember) => {
      upsertMember(m);
      if (m.id !== user?.id) toast(`${m.name} joined the room.`, "info");
    };
    const onMemberLeft = (userId: string) => removeMember(userId);
    const onFileAdded = (f: RoomFile) => {
      addFile(f);
      if (f.uploader?.id !== user?.id) toast(`"${f.name}" was added by ${f.uploader?.name?.split(" ")[0] || "someone"}.`, "info");
    };
    const onFileUpdated = ({ id, name }: { id: string; name: string }) => updateFile(id, { name });
    const onFileDeleted = ({ id }: { id: string }) => removeFile(id);
    const onUsage = ({ usedBytes }: { usedBytes: number }) => patchUsage(usedBytes);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("member:presence", onMemberPresence);
    socket.on("members:list", onMembers);
    socket.on("member:joined", onMemberJoined);
    socket.on("member:left", onMemberLeft);
    socket.on("file:added", onFileAdded);
    socket.on("file:updated", onFileUpdated);
    socket.on("file:deleted", onFileDeleted);
    socket.on("usage:updated", onUsage);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("member:presence", onMemberPresence);
      socket.off("members:list", onMembers);
      socket.off("member:joined", onMemberJoined);
      socket.off("member:left", onMemberLeft);
      socket.off("file:added", onFileAdded);
      socket.off("file:updated", onFileUpdated);
      socket.off("file:deleted", onFileDeleted);
      socket.off("usage:updated", onUsage);
    };
  }, [loadState, roomId, setMemberPresence, setMembers, upsertMember, removeMember, addFile, updateFile, removeFile, patchUsage, setConnected, user?.id, toast]);

  const updateProgress = useCallback((key: string, patch: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!room) return;
      const quotaLeft = room.usage.limitBytes - room.usage.usedBytes;
      for (const f of files) {
        if (f.size > quotaLeft) {
          toast(`"${f.name}" is too big for the room's remaining space.`, "error");
          continue;
        }
        const key = crypto.randomUUID();
        setUploads((prev) => [
          ...prev,
          { key, name: f.name, size: f.size, progress: 0, status: "uploading" },
        ]);
        uploadFile({
          roomId,
          file: f,
          onProgress: (p: UploadProgress) =>
            updateProgress(key, {
              progress: p.total ? Math.round((p.loaded / p.total) * 100) : 0,
            }),
        })
          .then(() => {
            updateProgress(key, { status: "done", progress: 100 });
            setTimeout(() => {
              setUploads((prev) => prev.filter((u) => u.key !== key));
            }, 1400);
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Upload failed.";
            updateProgress(key, { status: "error", error: message });
            toast(message, "error");
            setTimeout(() => {
              setUploads((prev) => prev.filter((u) => u.key !== key));
            }, 4200);
          });
      }
    },
    [room, roomId, updateProgress, toast]
  );

  const [savingToDrive, setSavingToDrive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveToDrive = async () => {
    if (!room || savingToDrive) return;
    setSavingToDrive(true);
    try {
      const res = await api.syncToDrive(roomId);
      setSavedSuccess(true);
      toast(
        res.syncedCount > 0
          ? `Saved ${res.syncedCount} file${res.syncedCount > 1 ? "s" : ""} to your Google Drive under G_Cloister / ${roomId}.`
          : `All room files are already saved in your Google Drive!`
      );
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save to Drive.", "error");
    } finally {
      setSavingToDrive(false);
    }
  };

  const copyInvite = async () => {
    const base = `${window.location.origin}/join?room=${roomId}`;
    const url = room?.password ? `${base}&pw=${encodeURIComponent(room.password)}` : base;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast(room?.password ? "Invite link with password copied!" : "Invite link copied — share the room password separately.");
    setTimeout(() => setCopied(false), 1600);
  };

  const leaveRoom = async () => {
    try {
      await api.leaveRoom(roomId);
      toast("You left the room.");
      router.push("/home");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not leave the room.", "error");
    }
  };

  const joinRoom = async () => {
    setJoining(true);
    try {
      await api.joinRoom(roomId, joinPw);
      toast("Welcome to the room.");
      loadRoom();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not join.", "error");
    } finally {
      setJoining(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <SpinnerGap size={26} className="animate-spin" />
          <span className="font-mono text-[13px] tracking-widest">{roomId}</span>
        </div>
      </div>
    );
  }

  if (loadState === "notfound") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
          <WarningCircle size={26} weight="duotone" className="text-faint" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Room not found</h1>
        <p className="mt-2 text-[14px] text-muted">{loadError}</p>
        <Button className="mt-6" variant="secondary" onClick={() => router.push("/home")} icon={<ArrowUUpLeft size={17} />}>
          Back to home
        </Button>
      </div>
    );
  }

  if (loadState === "member") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
          <LinkSimple size={26} weight="duotone" className="text-accent" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">This room is locked</h1>
        <p className="mt-2 text-[14px] text-muted">Enter the password a host shared with you to step inside.</p>
        <div className="mt-6 w-full max-w-xs">
          <input
            type="password"
            value={joinPw}
            onChange={(e) => setJoinPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            placeholder="Room password"
            autoFocus
            className="h-12 w-full rounded-xl border border-border bg-surface-2 px-4 text-center font-mono tracking-widest text-ink placeholder:text-faint focus:border-accent-border focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button className="mt-3 w-full" loading={joining} onClick={joinRoom} icon={!joining && <CaretRight size={17} />}>
            Enter the room
          </Button>
        </div>
      </div>
    );
  }

  if (loadState === "error" || !room) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft">
          <WarningCircle size={26} weight="duotone" className="text-danger" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Something went wrong</h1>
        <p className="mt-2 text-[14px] text-muted">{loadError}</p>
        <Button className="mt-6" variant="secondary" onClick={loadRoom}>Try again</Button>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)]">      <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-6 lg:px-8">
        {/* Room header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">G_Cloister</h1>
                <MonoChip className="px-2 py-0.5 text-[13px]">/{room.roomId}</MonoChip>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[12px] font-medium",
                    connected ? "text-accent" : "text-faint"
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {connected && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                    )}
                    <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", connected ? "bg-accent" : "bg-faint")} />
                  </span>
                  {connected ? "Live" : "Reconnecting…"}
                </span>
                <span className="text-faint">·</span>
                <span className="text-[12px] text-muted">
                  hosted by {room.host?.name?.split(" ")[0] || "someone"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MembersStack members={room.members} />
            <Button
              size="sm"
              variant="secondary"
              icon={copied ? <Check size={15} /> : <LinkSimple size={15} />}
              onClick={copyInvite}
            >
              {copied ? "Copied" : "Invite"}
            </Button>
            {!room.isHost && (
              <Button
                size="sm"
                variant={savedSuccess ? "primary" : "secondary"}
                icon={
                  savedSuccess ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <CloudArrowDown size={16} weight="regular" />
                  )
                }
                loading={savingToDrive}
                onClick={handleSaveToDrive}
              >
                {savingToDrive ? "Saving to Drive…" : savedSuccess ? "Saved to Drive" : "Save to Drive"}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              icon={<SignOut size={15} />}
              onClick={leaveRoom}
              className="text-danger hover:bg-danger/10"
            >
              Leave
            </Button>
          </div>
        </motion.div>

        {/* Usage */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass mt-6 rounded-2xl px-5 py-4"
        >
          <UsageBar usage={room.usage} />
        </motion.div>

        {uploads.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <AnimatePresence>
              {uploads.map((u) => (
                <motion.div
                  key={u.key}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="glass-solid flex items-center gap-3 rounded-xl px-4 py-2.5"
                >
                  <span
                    className={cn(
                      "shrink-0",
                      u.status === "done" && "text-accent",
                      u.status === "error" && "text-danger",
                      u.status === "uploading" && "text-faint"
                    )}
                  >
                    {u.status === "done" ? (
                      <CheckCircle size={18} weight="fill" />
                    ) : u.status === "error" ? (
                      <XCircle size={18} weight="fill" />
                    ) : (
                      <SpinnerGap size={18} className="animate-spin" />
                    )}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{u.name}</p>
                  {u.status === "error" ? (
                    <p className="text-[12px] text-danger">{u.error}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          animate={{ width: `${u.progress}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono text-[11px] tabular-nums text-faint">
                        {u.progress}%
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          <UploadDropzone onFiles={handleFiles} />
        </motion.div>

        {/* Files */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">
              {room.files.length} file{room.files.length === 1 ? "" : "s"}
            </h2>
            <span className="font-mono text-[12px] text-faint">sorted · newest first</span>
          </div>
          <FileGrid room={room} onPreview={setPreviewFile} />
        </motion.div>
      </div>

      <PreviewModal roomId={room.roomId} file={previewFile} onClose={() => setPreviewFile(null)} />
    </main>
  );
}

export default function RoomPage() {
  return (
    <RequireAuth>
      <AppNav backTo="/home" />
      <RoomInner />
    </RequireAuth>
  );
}
