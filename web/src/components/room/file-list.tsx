"use client";

import { AnimatePresence, motion } from "motion/react";
import { Copy, Check, DownloadSimple, Eye, TrashSimple, FileDashed } from "@phosphor-icons/react";
import { useState } from "react";
import type { Room, RoomFile } from "@/lib/types";
import { timeAgo, isPreviewable } from "@/lib/format";
import { FileIcon } from "@/components/file-icon";
import { Avatar, IconButton } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";

export function EmptyRoom({ isHost }: { isHost: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2">
        <FileDashed size={30} weight="duotone" className="text-faint" />
      </span>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">The room is empty</h3>
      <p className="mt-2 max-w-[40ch] text-[14px] leading-relaxed text-muted">
        {isHost
          ? "Drop the first file above and watch the room come alive for everyone."
          : "Drop a file above, or wait — the next upload lands here in real time."}
      </p>
    </div>
  );
}

function FileCard({
  file,
  roomId,
  canDelete,
  onPreview,
}: {
  file: RoomFile;
  roomId: string;
  canDelete: boolean;
  onPreview: (file: RoomFile) => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const previewable = isPreviewable(file.mimeType);

  const copyLink = async () => {
    await navigator.clipboard.writeText(api.downloadUrl(roomId, file.id));
    setCopied(true);
    toast("Download link copied.");
    setTimeout(() => setCopied(false), 1500);
  };

  const del = async () => {
    setDeleting(true);
    try {
      await api.deleteFile(roomId, file.id);
      toast(`"${file.name}" deleted.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete the file.", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-accent-border"
    >
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-surface/95 p-4 text-center backdrop-blur-sm border border-danger/30"
          >
            <TrashSimple size={24} className="text-danger" />
            <p className="mt-2 text-[13px] font-semibold text-ink">Delete this file?</p>
            <p className="mt-0.5 max-w-[90%] truncate text-[11.5px] text-muted">{file.name}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-7 rounded-lg border border-border bg-surface-2 px-2.5 text-[12px] font-medium text-muted transition-colors hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={del}
                disabled={deleting}
                className="h-7 rounded-lg bg-danger px-3 text-[12px] font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2">
          <FileIcon name={file.name} mimeType={file.mimeType} size={22} />
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
          {previewable && (
            <IconButton aria-label="Preview" onClick={() => onPreview(file)}>
              <Eye size={17} />
            </IconButton>
          )}
          <a
            href={api.downloadUrl(roomId, file.id)}
            download
            aria-label="Download"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink active:scale-95"
          >
            <DownloadSimple size={17} />
          </a>
          <IconButton aria-label="Copy link" onClick={copyLink}>
            {copied ? <Check size={17} className="text-accent" /> : <Copy size={17} />}
          </IconButton>
          {canDelete && (
            <IconButton aria-label="Delete" onClick={() => setConfirmDelete(true)}>
              <TrashSimple size={17} className="text-muted hover:text-danger" />
            </IconButton>
          )}
        </div>
      </div>

      <button
        onClick={() => previewable && onPreview(file)}
        className="mt-3.5 min-w-0 text-left"
      >
        <p className="truncate text-[14px] font-medium text-ink" title={file.name}>
          {file.name}
        </p>
      </button>
      <p className="mt-0.5 font-mono text-[11.5px] tabular-nums text-faint">
        {file.sizeFormatted} · {timeAgo(file.createdAt)}
      </p>

      <div className="mt-3.5 flex items-center gap-2 border-t border-border pt-3">
        <Avatar name={file.uploader.name} src={file.uploader.avatar} size={20} />
        <span className="truncate text-[12px] text-muted">
          {file.uploader.name.split(" ")[0]}
        </span>
      </div>
    </motion.div>
  );
}

export function FileGrid({
  room,
  onPreview,
}: {
  room: Room;
  onPreview: (file: RoomFile) => void;
}) {
  const { user } = useAuth();
  const files = room.files;

  return (
    <>
      {files.length === 0 ? (
        <EmptyRoom isHost={room.isHost} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                roomId={room.roomId}
                canDelete={room.isHost || file.uploader.id === user?.id}
                onPreview={onPreview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
