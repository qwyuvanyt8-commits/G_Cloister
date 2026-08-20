"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Check,
  LinkSimple,
  SpinnerGap,
  XCircle,
  CheckCircle,
  SignOut,
  CloudArrowDown,
  House,
  LockKey,
  FolderOpen,
  Crown,
} from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui";
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

const EASE = [0.16, 1, 0.3, 1] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function RoomInner() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId ?? "";
  const { user, hasDrive, openDriveModal } = useAuth();
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const room = useRoomStore((s) => s.room);
  const connected = useRoomStore((s) => s.connected);
  const setRoom = useRoomStore((s) => s.setRoom);
  const addFile = useRoomStore((s) => s.addFile);
  const updateFile = useRoomStore((s) => s.updateFile);
  const removeFile = useRoomStore((s) => s.removeFile);
  const reorderFiles = useRoomStore((s) => s.reorderFiles);
  const patchUsage = useRoomStore((s) => s.patchUsage);
  const setMembers = useRoomStore((s) => s.setMembers);
  const upsertMember = useRoomStore((s) => s.upsertMember);
  const removeMember = useRoomStore((s) => s.removeMember);
  const setMemberPresence = useRoomStore((s) => s.setMemberPresence);
  const syncMemberPresence = useRoomStore((s) => s.syncMemberPresence);
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
    const onPresenceSync = ({ onlineUserIds }: { onlineUserIds: string[] }) =>
      syncMemberPresence(onlineUserIds);
    const onMembers = (members: RoomMember[]) => setMembers(members);
    const onMemberJoined = (m: RoomMember) => {
      upsertMember(m);
      if (m.id !== user?.id) toast(`${m.name} joined the room.`, "info");
    };
    const onMemberLeft = (userId: string) => removeMember(userId);
    const onMemberKicked = ({ userId }: { userId: string }) => {
      if (userId === user?.id) {
        toast("You have been kicked from this room by the host.", "error");
        router.push("/home");
      } else {
        upsertMember({ id: userId, kicked: true, left: true, online: false } as unknown as RoomMember);
      }
    };
    const onMemberUnkicked = ({ userId }: { userId: string }) => {
      upsertMember({ id: userId, kicked: false } as unknown as RoomMember);
    };
    const onFileAdded = (f: RoomFile) => {
      addFile(f);
      if (f.uploader?.id !== user?.id) toast(`"${f.name}" was added by ${f.uploader?.name?.split(" ")[0] || "someone"}.`, "info");
    };
    const onFileUpdated = ({ id, name }: { id: string; name: string }) => updateFile(id, { name });
    const onFileDeleted = ({ id }: { id: string }) => removeFile(id);
    const onFilesOrdered = ({ fileIds }: { fileIds: string[] }) => reorderFiles(fileIds);
    const onUsage = ({ usedBytes }: { usedBytes: number }) => patchUsage(usedBytes);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("member:presence", onMemberPresence);
    socket.on("room:presence:sync", onPresenceSync);
    socket.on("members:list", onMembers);
    socket.on("member:joined", onMemberJoined);
    socket.on("member:left", onMemberLeft);
    socket.on("member:kicked", onMemberKicked);
    socket.on("member:unkicked", onMemberUnkicked);
    socket.on("file:added", onFileAdded);
    socket.on("file:updated", onFileUpdated);
    socket.on("file:deleted", onFileDeleted);
    socket.on("files:ordered", onFilesOrdered);
    socket.on("usage:updated", onUsage);

    const handleUnload = () => {
      socket.emit("room:leave", { roomId });
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    if (socket.connected) onConnect();

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      socket.emit("room:leave", { roomId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("member:presence", onMemberPresence);
      socket.off("room:presence:sync", onPresenceSync);
      socket.off("members:list", onMembers);
      socket.off("member:joined", onMemberJoined);
      socket.off("member:left", onMemberLeft);
      socket.off("member:kicked", onMemberKicked);
      socket.off("member:unkicked", onMemberUnkicked);
      socket.off("file:added", onFileAdded);
      socket.off("file:updated", onFileUpdated);
      socket.off("file:deleted", onFileDeleted);
      socket.off("files:ordered", onFilesOrdered);
      socket.off("usage:updated", onUsage);
    };
  }, [loadState, roomId, router, setMemberPresence, syncMemberPresence, setMembers, upsertMember, removeMember, addFile, updateFile, removeFile, reorderFiles, patchUsage, setConnected, user?.id, toast]);

  const updateProgress = useCallback((key: string, patch: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!room || files.length === 0) return;

      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      if (room.usage.usedBytes + totalSize > room.usage.limitBytes) {
        toast("Upload exceeds the room storage limit.", "error");
        return;
      }

      for (const file of files) {
        const key = `${file.name}-${Date.now()}-${Math.random()}`;
        setUploads((prev) => [
          { key, name: file.name, size: file.size, progress: 0, status: "uploading" },
          ...prev,
        ]);

        try {
          const res = await uploadFile({
            roomId,
            file,
            onProgress: (p: UploadProgress) =>
              updateProgress(key, {
                progress: p.total ? Math.round((p.loaded / p.total) * 100) : 0,
              }),
          });
          updateProgress(key, { progress: 100, status: "done" });
          addFile(res);
          toast(`"${file.name}" uploaded successfully.`);
          setTimeout(() => {
            setUploads((prev) => prev.filter((u) => u.key !== key));
          }, 2500);
        } catch (err: unknown) {
          const errObj = err as { code?: string; status?: number; message?: string };
          const msg = err instanceof Error ? err.message : "Upload failed";
          updateProgress(key, { status: "error", error: msg });
          if (errObj?.code === "DRIVE_NO_TOKEN" || errObj?.code === "DRIVE_AUTH" || errObj?.status === 403) {
            openDriveModal(
              "Google Drive Access Required",
              "Uploading files or accessing host Drive storage requires Google Drive permissions."
            );
          } else {
            toast(`Failed to upload "${file.name}": ${msg}`, "error");
          }
        }
      }
    },
    [room, roomId, updateProgress, toast, addFile, openDriveModal]
  );

  const [savingToDrive, setSavingToDrive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveToDrive = async () => {
    if (!room || savingToDrive) return;
    if (!hasDrive) {
      openDriveModal(
        "Google Drive Access Needed to Sync",
        "Saving room files to your own Google Drive requires Google Drive permission."
      );
      return;
    }
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
    } catch (err: unknown) {
      const errObj = err as { code?: string; status?: number; message?: string };
      if (errObj?.code === "DRIVE_NO_TOKEN" || errObj?.code === "DRIVE_AUTH" || errObj?.status === 403) {
        openDriveModal(
          "Google Drive Access Needed to Sync",
          "Saving room files to your own Google Drive requires Google Drive permission."
        );
      } else {
        toast(err instanceof Error ? err.message : "Could not save to Drive.", "error");
      }
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
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = async () => {
    try {
      await api.leaveRoom(roomId);
      toast("You left the room.");
      router.push("/home");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to leave room.", "error");
    }
  };

  const loadStates = {
    notfound: (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gc-orange/30 bg-gc-orange/10 text-gc-orange">
          <House size={28} weight="duotone" />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Room not found</h1>
        <p className="mt-2 font-mono text-[12px] leading-relaxed text-gc-muted">
          We couldn&apos;t find room <span className="font-bold text-gc-ink">/{roomId}</span>. Double-check the
          room ID or create a new room.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push("/home")}>
            Go to home
          </Button>
          <Button onClick={() => router.push("/host")}>Host a room</Button>
        </div>
      </div>
    ),
    member: (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gc-cobalt text-white shadow-[0_10px_36px_-10px_rgba(68,86,232,0.7)]">
          <LockKey size={28} weight="bold" />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Enter password for /{roomId}</h1>
        <p className="mt-2 font-mono text-[12px] leading-relaxed text-gc-muted">
          You are not currently inside this room. Enter the password set by the host to join.
        </p>
        <form
          className="mt-7 w-full space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setJoining(true);
            try {
              const res = await api.joinRoom(roomId, joinPw);
              setRoom(res);
              setLoadState("ready");
              toast(`Welcome to /${roomId}!`);
            } catch (err: unknown) {
              toast(err instanceof Error ? err.message : "Could not join room.", "error");
            } finally {
              setJoining(false);
            }
          }}
        >
          <input
            type="password"
            placeholder="Room password"
            value={joinPw}
            onChange={(e) => setJoinPw(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-mono text-gc-ink placeholder:text-gc-faint focus:border-gc-cobalt focus:outline-none"
            autoFocus
          />
          <Button type="submit" loading={joining} className="w-full">
            Join Room
          </Button>
        </form>
      </div>
    ),
    error: (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
        <p className="mt-2 font-mono text-[12px] text-gc-orange">{loadError || "Unable to load room."}</p>
        <Button variant="secondary" className="mt-7" onClick={() => router.push("/home")}>
          Return to home
        </Button>
      </div>
    ),
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#0b0d12] text-gc-ink">
      {loadState === "loading" && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-gc-cobalt" />
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-gc-faint">Entering room /{roomId}…</p>
        </div>
      )}

      {loadState !== "loading" && loadState !== "ready" && <div className="min-h-[70vh]">{loadStates[loadState ?? "error"]}</div>}

      {loadState === "ready" && room && (
        <>
          <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-8">
            {/* Top header bar */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gc-cobalt text-white shadow-[0_8px_24px_-8px_rgba(68,86,232,0.8)]">
                  <FolderOpen size={22} weight="bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-mono text-2xl font-bold tracking-tight">/{room.roomId}</h1>
                    {room.isHost && (
                      <span className="flex items-center gap-1 rounded-full border border-gc-cobalt/40 bg-gc-cobalt/10 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#7c8bff]">
                        <Crown size={10} weight="fill" />
                        Host
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em]",
                        connected
                          ? "border border-gc-cobalt/40 bg-gc-cobalt/10 text-[#7c8bff]"
                          : "border border-dashed border-white/20 bg-white/[0.03] text-gc-faint"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          connected ? "bg-gc-cobalt shadow-[0_0_8px_rgba(68,86,232,0.9)]" : "bg-gc-faint"
                        )}
                      />
                      {connected ? "Live" : "Reconnecting"}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-faint">
                      hosted by {room.host?.name?.split(" ")[0] || "someone"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <MembersStack members={room.members} isHost={room.isHost} roomId={room.roomId} />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={copied ? <Check size={15} /> : <LinkSimple size={15} />}
                  onClick={copyInvite}
                >
                  {copied ? "Copied" : "Invite"}
                </Button>
                {room.isHost ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Check size={15} className="text-gc-cobalt" weight="bold" />}
                    onClick={() => {
                      toast(`All room files are automatically saved in your Google Drive (G_Cloister/${room.roomId}).`, "info");
                    }}
                  >
                    Saved to Drive
                  </Button>
                ) : hasDrive ? (
                  <Button
                    size="sm"
                    variant={savedSuccess ? "primary" : "secondary"}
                    icon={
                      savedSuccess ? (
                        <Check size={15} weight="bold" />
                      ) : (
                        <CloudArrowDown size={15} weight="duotone" />
                      )
                    }
                    loading={savingToDrive}
                    onClick={handleSaveToDrive}
                  >
                    {savingToDrive ? "Saving to Drive…" : savedSuccess ? "Saved to Drive" : "Save to Drive"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<SignOut size={15} />}
                  onClick={leaveRoom}
                  className="text-gc-orange hover:text-gc-orange-dark"
                >
                  Leave
                </Button>
              </div>
            </motion.div>

            {/* Usage */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5, ease: EASE }}
              className="mt-6 rounded-2xl border border-white/10 bg-[#12151c] px-5 py-4"
            >
              <UsageBar usage={room.usage} />
            </motion.div>

            {/* Uploads in flight */}
            <AnimatePresence>
              {uploads.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {uploads.map((u) => (
                    <motion.div
                      key={u.key}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#12151c] px-4 py-3"
                    >
                      <span
                        className={cn(
                          "shrink-0",
                          u.status === "done" && "text-gc-cobalt",
                          u.status === "error" && "text-gc-orange",
                          u.status === "uploading" && "text-gc-faint"
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
                      <p className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-bold text-gc-ink">{u.name}</p>
                      {u.status === "error" ? (
                        <p className="font-mono text-[11px] text-gc-orange">{u.error}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div className="h-full bg-gc-cobalt" animate={{ width: `${u.progress}%` }} />
                          </div>
                          <span className="w-9 text-right font-mono text-[11px] tabular-nums text-gc-faint">
                            {u.progress}%
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Dropzone */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5, ease: EASE }}
              className="mt-6"
            >
              <UploadDropzone onFiles={handleFiles} />
            </motion.div>

            {/* Files */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: EASE }}
              className="mt-8"
            >
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="text-lg font-black tracking-tight">
                  {room.files.length} file{room.files.length === 1 ? "" : "s"}
                </h2>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-gc-faint">
                  {room.isHost ? "drag a card to arrange · order is live for everyone" : "order arranged by the host"}
                </span>
              </div>
              <FileGrid room={room} onPreview={setPreviewFile} />
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-10 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gc-faint"
            >
              total {formatBytes(room.usage.usedBytes)} of {room.usage.limitFormatted} · synced with the host&apos;s Google Drive
            </motion.p>
          </div>

          <PreviewModal roomId={room.roomId} file={previewFile} onClose={() => setPreviewFile(null)} />
        </>
      )}
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