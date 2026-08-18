"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DownloadSimple, SpinnerGap } from "@phosphor-icons/react";
import type { RoomFile } from "@/lib/types";
import { api, getStoredToken } from "@/lib/api";
import { isImage, isTextFile } from "@/lib/format";
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
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const img = file && isImage(file.mimeType);
  const text = file && isTextFile(file.mimeType, file.name);

  useEffect(() => {
    if (!file) return;
    setLink(null);
    setError(null);
    setTextContent(null);
    let cancelled = false;
    setLoading(true);

    if (text) {
      const token = getStoredToken();
      fetch(api.downloadUrl(roomId, file.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load text file");
          return r.text();
        })
        .then((t) => {
          if (!cancelled) setTextContent(t);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

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
  }, [roomId, file, text]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
            className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden border-4 border-gc-ink bg-paper shadow-[8px_8px_0_var(--gc-shadow)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-gc-ink/40 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-gc-ink bg-paper-2">
                  <FileIcon name={file.name} mimeType={file.mimeType} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-gc-ink">{file.name}</p>
                  <p className="font-space-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-faint">
                    {file.sizeFormatted} · {file.uploader.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={api.downloadUrl(roomId, file.id)}
                  download
                  className="inline-flex h-9 items-center gap-1.5 border-2 border-gc-ink bg-paper-2 px-3 font-space-mono text-[11px] font-bold uppercase tracking-[0.06em] text-gc-ink transition-colors hover:border-gc-cobalt hover:text-gc-cobalt active:scale-[0.98]"
                >
                  <DownloadSimple size={15} />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center border-2 border-gc-ink bg-paper text-gc-muted transition-colors hover:bg-gc-ink hover:text-paper"
                  aria-label="Close preview"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto border-t-2 border-gc-ink bg-paper-2/50 p-5">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-gc-muted">
                  <SpinnerGap size={26} className="animate-spin text-gc-cobalt" />
                  <span className="font-space-mono text-[11px] uppercase tracking-[0.1em]">Opening preview…</span>
                </div>
              )}
              {error && !loading && (
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                  <FileIcon name={file.name} mimeType={file.mimeType} size={34} />
                  <p className="max-w-[36ch] font-space-mono text-[12px] uppercase tracking-[0.04em] text-gc-muted">{error}</p>
                  <a
                    href={api.downloadUrl(roomId, file.id)}
                    download
                    className="inline-flex h-10 items-center gap-2 border-2 border-gc-ink bg-gc-cobalt px-4 font-space-mono text-[11px] font-bold uppercase tracking-[0.06em] text-paper shadow-[2px_2px_0_var(--gc-shadow)] transition-colors hover:bg-gc-cobalt-dark"
                  >
                    <DownloadSimple size={15} />
                    Download instead
                  </a>
                </div>
              )}
              {!loading && textContent !== null ? (
                <div className="h-[72dvh] w-full overflow-auto border-2 border-gc-ink bg-[var(--gc-shadow)] p-5 font-space-mono text-[13px] leading-relaxed text-[#e9e4d5]">
                  <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
                </div>
              ) : (
                link && !loading && (
                  img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={link.contentLink}
                      alt={file.name}
                      className="max-h-[72dvh] max-w-full border-2 border-gc-ink object-contain"
                    />
                  ) : (
                    <iframe
                      src={link.viewLink}
                      title={file.name}
                      className="h-[72dvh] w-full border-0 bg-white"
                      sandbox="allow-same-origin allow-scripts allow-popups"
                    />
                  )
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
