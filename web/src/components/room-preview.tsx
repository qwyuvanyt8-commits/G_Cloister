import { CloudCheck, HardDrive, UploadSimple } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui";
import { FileIcon } from "@/components/file-icon";
import { cn } from "@/lib/cn";

const FILES = [
  { name: "trailer-final.mov", mime: "video/quicktime", meta: "412 MB · 2m ago" },
  { name: "style-guide-v3.pdf", mime: "application/pdf", meta: "8.4 MB · 12m ago" },
  { name: "kit-launch.psd", mime: "image/vnd.adobe.photoshop", meta: "1.2 GB · 1h ago" },
];

const MEMBERS = [
  { name: "Priya Raman", hue: "bg-gc-cobalt" },
  { name: "Daniel Osei", hue: "bg-gc-orange" },
  { name: "Leo Tanaka", hue: "bg-gc-mint" },
  { name: "Ana Voss", hue: "bg-gc-ink" },
];

export function RoomPreview({
  tone = "dark",
  sharp = false,
  className,
}: {
  tone?: "dark" | "light";
  sharp?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  const radius = sharp ? "rounded-none" : "rounded-xl";
  return (
    <div
      className={cn(
        "overflow-hidden border text-left",
        radius,
        dark
          ? "border-white/10 bg-[#0f1319] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.75)]"
          : "border-[#0c0f14]/12 bg-white shadow-[0_24px_70px_-28px_rgba(12,15,20,0.35)]",
        className
      )}
    >
      {/* window chrome */}
      <div
        className={cn(
          "flex h-11 items-center justify-between border-b px-4",
          dark ? "border-white/8" : "border-[#0c0f14]/10"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-proto-accent text-[9px] font-black text-white">
            G_
          </span>
          <span
            className={cn(
              "font-mono text-[11px] tracking-tight",
              dark ? "text-[#eef1f6]" : "text-[#0c0f14]"
            )}
          >
            scriptorium-204
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
              dark ? "text-[#7c8bff]" : "text-proto-accent"
            )}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-proto-accent" />
            Live
          </span>
          <div className="flex -space-x-1.5">
            {MEMBERS.map((m) => (
              <Avatar key={m.name} name={m.name} size={22} className={cn("ring-2", dark ? "ring-[#0f1319]" : "ring-white")} />
            ))}
          </div>
        </div>
      </div>

      {/* usage */}
      <div className="px-4 pt-4">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[10.5px] tracking-[0.04em]">
          <span className={cn("uppercase tracking-[0.16em]", dark ? "text-[#8b93a1]" : "text-[#5a6472]")}>
            Room storage
          </span>
          <span className={cn(dark ? "text-[#eef1f6]" : "text-[#0c0f14]")}>
            3.2 <span className={dark ? "text-[#5b6472]" : "text-[#9aa3b0]"}>/</span> 5.0&nbsp;GB
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {[64, 8, 16, 8, 4].map((w, i) => (
            <span
              key={i}
              className={cn("h-1.5 rounded-full", i === 0 ? "bg-proto-accent" : dark ? "bg-white/10" : "bg-[#0c0f14]/10")}
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
      </div>

      {/* files */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {FILES.map((f, i) => (
          <div
            key={f.name}
            className={cn(
              "rounded-lg border p-2.5",
              dark ? "border-white/8 bg-white/[0.03]" : "border-[#0c0f14]/10 bg-[#f7f8fa]"
            )}
            style={{ transform: `translateY(${i * 6}px)` }}
          >
            <FileIcon name={f.name} mimeType={f.mime} size={18} />
            <p
              className={cn(
                "mt-2 truncate text-[11px] font-semibold tracking-tight",
                dark ? "text-[#eef1f6]" : "text-[#0c0f14]"
              )}
              title={f.name}
            >
              {f.name}
            </p>
            <p className={cn("mt-0.5 font-mono text-[8.5px] tabular-nums", dark ? "text-[#5b6472]" : "text-[#9aa3b0]")}>
              {f.meta}
            </p>
          </div>
        ))}
      </div>

      {/* drop zone */}
      <div className="px-4 pb-4 pt-5">
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-dashed px-4 py-3",
            dark ? "border-white/15" : "border-[#0c0f14]/25"
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em]",
              dark ? "text-[#8b93a1]" : "text-[#5a6472]"
            )}
          >
            <UploadSimple size={14} weight="bold" />
            Drop a file, it streams to everyone
          </span>
          <span className={cn("flex items-center gap-1.5", dark ? "text-[#7c8bff]" : "text-proto-accent")}>
            <CloudCheck size={13} weight="fill" />
            <HardDrive size={13} weight="fill" />
          </span>
        </div>
      </div>
    </div>
  );
}