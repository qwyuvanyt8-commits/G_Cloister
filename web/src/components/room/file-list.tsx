"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Check, DownloadSimple, Eye, TrashSimple, FileDashed, DotsSixVertical } from "@phosphor-icons/react";
import type { Room, RoomFile } from "@/lib/types";
import { timeAgo, isPreviewable } from "@/lib/format";
import { FileIcon } from "@/components/file-icon";
import { Avatar, IconButton } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";
import { useRoomStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export function EmptyRoom({ isHost }: { isHost: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#161a23] text-[#565e6b]">
        <FileDashed size={30} weight="duotone" />
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-md bg-gc-cobalt"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
        />
      </span>
      <div aria-hidden className="tear-guide mt-6 w-40 text-gc-faint" />
      <h3 className="mt-4 text-lg font-black tracking-tight">The room is empty</h3>
      <p className="mt-2 max-w-[40ch] font-mono text-[11.5px] uppercase tracking-[0.06em] leading-relaxed text-gc-muted">
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
  dragHandle,
  ghosted,
}: {
  file: RoomFile;
  roomId: string;
  canDelete: boolean;
  onPreview: (file: RoomFile) => void;
  dragHandle?: { onPointerDown: (e: React.PointerEvent, fileId: string) => void };
  ghosted?: boolean;
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
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#12151c] p-4 transition-all duration-150 hover:border-gc-cobalt/50 hover:-translate-y-0.5",
        ghosted && "invisible"
      )}
    >
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#12151c] p-4 text-center"
          >
            <TrashSimple size={24} className="text-gc-orange" />
            <p className="mt-2 text-[13px] font-extrabold uppercase tracking-tight">Delete this file?</p>
            <p className="mt-0.5 max-w-[90%] truncate font-mono text-[10.5px] text-gc-muted">{file.name}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-8 rounded-full border border-white/15 px-3 font-mono text-[11px] font-bold uppercase text-gc-muted transition-colors hover:text-gc-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={del}
                disabled={deleting}
                className="h-8 rounded-full bg-gc-orange px-3.5 font-mono text-[11px] font-bold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-2">
        {dragHandle && (
          <span
            onPointerDown={(e) => dragHandle.onPointerDown(e, file.id)}
            title="Drag to reorder"
            aria-label="Drag to reorder"
            className="inline-flex shrink-0 cursor-grab touch-none select-none items-center justify-center pt-2 text-gc-faint transition-colors hover:text-[#7c8bff] active:cursor-grabbing"
          >
            <DotsSixVertical size={18} weight="bold" />
          </span>
        )}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gc-muted transition-colors hover:bg-white/[0.06] hover:text-gc-ink active:scale-95"
          >
            <DownloadSimple size={17} />
          </a>
          <IconButton aria-label="Copy link" onClick={copyLink}>
            {copied ? <Check size={17} className="text-gc-cobalt" /> : <Copy size={17} />}
          </IconButton>
          {canDelete && (
            <IconButton aria-label="Delete" onClick={() => setConfirmDelete(true)}>
              <TrashSimple size={17} className="text-gc-muted hover:text-gc-orange" />
            </IconButton>
          )}
        </div>
      </div>

      <button onClick={() => previewable && onPreview(file)} className="mt-3.5 min-w-0 text-left">
        <p className="truncate text-[14px] font-bold tracking-tight" title={file.name}>
          {file.name}
        </p>
      </button>
      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-gc-faint">
        {file.sizeFormatted} · {timeAgo(file.createdAt)}
      </p>

      <div className="mt-3.5 flex items-center gap-2 border-t border-white/10 pt-2.5">
        <Avatar name={file.uploader.name} src={file.uploader.avatar} size={20} />
        <span className="truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-muted">
          {file.uploader.name.split(" ")[0]}
        </span>
        <span aria-hidden className="ml-auto h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
      </div>
    </div>
  );
}

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

interface Cell {
  x: number;
  y: number;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function HostFileGrid({
  room,
  onPreview,
}: {
  room: Room;
  onPreview: (file: RoomFile) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const reorderFiles = useRoomStore((s) => s.reorderFiles);

  const gridRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<RoomFile[]>(room.files);

  const dragRef = useRef<{
    id: string;
    index: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    w: number;
    h: number;
    cells: Cell[];
  } | null>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    orderRef.current = room.files;
  });

  const persist = useCallback(() => {
    const order = orderRef.current;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        await api.reorderFiles(room.roomId, order.map((f) => f.id));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not save the new order.", "error");
        try {
          const fresh = await api.getRoom(room.roomId);
          reorderFiles(fresh.files.map((f) => f.id));
        } catch {
          /* ignore refetch failure */
        }
      } finally {
        debounceRef.current = null;
      }
    }, 400);
  }, [room.roomId, toast, reorderFiles]);

  const onMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        setDragState({ id: d.id, x: d.originLeft + dx, y: d.originTop + dy, w: d.w, h: d.h });

        const ghostCenterX = d.originLeft + d.w / 2 + dx;
        const ghostCenterY = d.originTop + d.h / 2 + dy;
        let target = d.index;
        let best = Infinity;
        for (let i = 0; i < d.cells.length; i++) {
          const c = d.cells[i];
          const dist = (c.x - ghostCenterX) ** 2 + (c.y - ghostCenterY) ** 2;
          if (dist < best) {
            best = dist;
            target = i;
          }
        }
        if (target !== d.index) {
          const current = orderRef.current;
          const moved = arrayMove(current, d.index, target);
          orderRef.current = moved;
          d.index = target;
          reorderFiles(moved.map((f) => f.id));
          persist();
        }
      });
    },
    [reorderFiles, persist]
  );

  const endDrag = useCallback(() => {
    window.removeEventListener("pointermove", onMove);
    dragRef.current = null;
    setDragState(null);
  }, [onMove]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
      window.removeEventListener("pointermove", onMove);
    };
  }, [onMove]);

  const handlePointerDown = (e: React.PointerEvent, fileId: string) => {
    if (room.files.length < 2) return;
    e.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    let el: HTMLElement | null = null;
    for (const child of grid.children) {
      if (child instanceof HTMLElement && child.dataset.fileId === fileId) {
        el = child;
        break;
      }
    }
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const lefts = new Set<number>();
    const tops = new Set<number>();
    let w = 0;
    let h = 0;
    for (const child of grid.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.dataset.fileId === fileId) continue;
      const r = child.getBoundingClientRect();
      lefts.add(Math.round(r.left));
      tops.add(Math.round(r.top));
      w = Math.max(w, r.width);
      h = Math.max(h, r.height);
    }
    lefts.add(Math.round(rect.left));
    tops.add(Math.round(rect.top));
    w = Math.max(w, rect.width);
    h = Math.max(h, rect.height);
    const colLefts = [...lefts].sort((a, b) => a - b);
    const rowTops = [...tops].sort((a, b) => a - b);
    const cells: Cell[] = [];
    for (const top of rowTops) {
      for (const left of colLefts) {
        cells.push({ x: left + rect.width / 2, y: top + rect.height / 2 });
      }
    }

    dragRef.current = {
      id: fileId,
      index: room.files.findIndex((f) => f.id === fileId),
      startX: e.clientX,
      startY: e.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      w: rect.width,
      h: rect.height,
      cells: cells.slice(0, room.files.length),
    };
    setDragState({ id: fileId, x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag, { once: true });
  };

  const canDelete = (file: RoomFile) => room.isHost || file.uploader.id === user?.id;
  const isDragging = dragState !== null;

  return (
    <>
      <div
        ref={gridRef}
        className={cn(GRID, isDragging && "cursor-grabbing select-none")}
      >
        {room.files.map((file) => (
          <motion.div
            layout
            key={file.id}
            data-file-id={file.id}
            className="h-full min-w-0"
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <FileCard
              file={file}
              roomId={room.roomId}
              canDelete={canDelete(file)}
              onPreview={onPreview}
              ghosted={isDragging && file.id === dragState.id}
              dragHandle={{ onPointerDown: handlePointerDown }}
            />
          </motion.div>
        ))}
      </div>

      {dragState && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: dragState.x,
            top: dragState.y,
            width: dragState.w,
            height: dragState.h,
          }}
        >
          <FileCard
            file={room.files.find((f) => f.id === dragState.id) ?? room.files[0]}
            roomId={room.roomId}
            canDelete={canDelete(
              room.files.find((f) => f.id === dragState.id) ?? room.files[0]
            )}
            onPreview={onPreview}
          />
        </div>
      )}
    </>
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
  const isHost = room.isHost;
  const canDelete = (file: RoomFile) => room.isHost || file.uploader.id === user?.id;

  if (files.length === 0) {
    return <EmptyRoom isHost={room.isHost} />;
  }

  if (isHost) {
    return <HostFileGrid room={room} onPreview={onPreview} />;
  }

  return (
    <div className={GRID}>
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="h-full min-w-0"
          >
            <FileCard
              file={file}
              roomId={room.roomId}
              canDelete={canDelete(file)}
              onPreview={onPreview}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}