"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DownloadSimple, SpinnerGap } from "@phosphor-icons/react";
import type { RoomFile } from "@/lib/types";
import { api } from "@/lib/api";
import { isImage } from "@/lib/format";
import { FileIcon } from "@/components/file-icon";

export function PreviewModal({
  roomId,
  file,
  onClose,
}: {
  roomId: string;
  file: RoomFile | null;
  onClose: () => void;
}) {
  const [link, setLink] = useState<{ viewLink: string; contentLink: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    setLink(null);
    setError(null);
    let cancelled = false;
    setLoading(true);
    api
      .preview(roomId, file.id)
      .then((r) => {
        if (!cancelled) setLink({ viewLink: r.viewLink, contentLink: r.contentLink });
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Preview unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const img = file && isImage(file.mimeType);

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${file.name}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon name={file.name} mimeType={file.mimeType} size={18} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-ink">{file.name}</p>
                  <p className="font-mono text-[11px] text-faint">
                    {file.sizeFormatted} · {file.uploader.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={api.downloadUrl(roomId, file.id)}
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-accent-border hover:text-accent active:scale-[0.98]"
                >
                  <DownloadSimple size={15} />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  aria-label="Close preview"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-surface-2/60 p-5">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-muted">
                  <SpinnerGap size={26} className="animate-spin" />
                  <span className="text-[13px]">Opening preview…</span>
                </div>
              )}
              {error && !loading && (
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                  <FileIcon name={file.name} mimeType={file.mimeType} size={34} />
                  <p className="max-w-[36ch] text-sm text-muted">{error}</p>
                  <a
                    href={api.downloadUrl(roomId, file.id)}
                    download
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-[13px] font-medium text-[#04120c] transition-colors hover:bg-accent-strong"
                  >
                    <DownloadSimple size={15} />
                    Download instead
                  </a>
                </div>
              )}
              {link && !loading && (
                img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.contentLink}
                    alt={file.name}
                    className="max-h-[72dvh] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <iframe
                    src={link.viewLink}
                    title={file.name}
                    className="h-[72dvh] w-full rounded-lg border-0 bg-white"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                  />
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
