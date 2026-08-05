export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  const str = v >= 100 ? v.toFixed(0) : v.toFixed(1);
  return `${str} ${units[i]}`;
}

export function timeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function isPreviewable(mime: string): boolean {
  if (!mime) return false;
  return (
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    mime.startsWith("text/")
  );
}

export function isImage(mime: string): boolean {
  return mime?.startsWith("image/") && !mime.includes("svg");
}

export function fileKind(mime: string, name: string): string {
  if (isImage(mime)) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime?.startsWith("video/")) return "video";
  if (mime?.startsWith("audio/")) return "audio";
  if (mime?.startsWith("text/")) return "text";
  if (mime === "application/zip" || mime?.includes("compressed")) return "archive";
  if (mime?.includes("presentation")) return "slides";
  if (mime?.includes("spreadsheet")) return "sheet";
  if (mime?.includes("document")) return "doc";
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ext || "file";
}
