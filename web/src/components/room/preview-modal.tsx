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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
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
            className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-[0_50px_110px_-40px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <FileIcon name={file.name} mimeType={file.mimeType} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-gc-ink">{file.name}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gc-faint">
                    {file.sizeFormatted} · {file.uploader.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={api.downloadUrl(roomId, file.id)}
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-gc-ink transition-colors hover:border-gc-cobalt hover:text-[#7c8bff] active:scale-[0.98]"
                >
                  <DownloadSimple size={15} />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gc-muted transition-colors hover:bg-white/[0.06] hover:text-gc-ink"
                  aria-label="Close preview"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-white/[0.02] p-5">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-gc-muted">
                  <SpinnerGap size={26} className="animate-spin text-gc-cobalt" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em]">Opening preview…</span>
                </div>
              )}
              {error && !loading && (
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                  <FileIcon name={file.name} mimeType={file.mimeType} size={34} />
                  <p className="max-w-[36ch] font-mono text-[12px] uppercase tracking-[0.04em] text-gc-muted">{error}</p>
                  <a
                    href={api.downloadUrl(roomId, file.id)}
                    download
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gc-cobalt px-4 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90"
                  >
                    <DownloadSimple size={15} />
                    Download instead
                  </a>
                </div>
              )}
              {!loading && textContent !== null ? (
                <div className="h-[72dvh] w-full overflow-auto rounded-lg border border-white/10 bg-[#0a0c10] p-5 font-mono text-[13px] leading-relaxed text-[#cdd3e0]">
                  <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
                </div>
              ) : (
                link &&
                !loading &&
                (img ? (
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
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}