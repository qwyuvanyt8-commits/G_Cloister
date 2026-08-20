"use client";

import { useCallback, useRef, useState } from "react";
import { CloudArrowUp } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "group relative cursor-pointer rounded-2xl border border-dashed px-6 py-10 text-center transition-all duration-150",
        drag
          ? "scale-[1.005] border-gc-cobalt bg-gc-cobalt/[0.06]"
          : "border-white/15 bg-white/[0.02] hover:border-gc-cobalt/60 hover:bg-white/[0.04]"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <span
        className={cn(
          "relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-150",
          drag ? "bg-gc-cobalt text-white" : "bg-[#161a23] text-[#7c8bff] group-hover:scale-105"
        )}
      >
        <CloudArrowUp size={28} weight="duotone" />
      </span>
      <p className="relative mt-4 text-[16px] font-black tracking-tight">
        {drag ? "Drop to add files" : "Drag & drop files here"}
      </p>
      <p className="relative mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-gc-muted">
        or{" "}
        <span className="font-bold text-[#7c8bff] underline-offset-4 group-hover:underline">
          browse your device
        </span>{" "}
        — drop as many as you like
      </p>
    </div>
  );
}