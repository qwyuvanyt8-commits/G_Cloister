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
        "group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300",
        drag
          ? "border-accent bg-accent-soft scale-[1.01]"
          : "border-border hover:border-accent-border hover:bg-accent-soft/40"
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
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        className={cn(
          "relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
          drag ? "bg-accent text-[#04120c] -translate-y-1" : "bg-surface-2 text-accent group-hover:scale-105"
        )}
      >
        <CloudArrowUp size={28} weight="duotone" />
      </span>
      <p className="relative mt-4 text-[15px] font-medium text-ink">
        {drag ? "Drop to add files" : "Drag & drop files here"}
      </p>
      <p className="relative mt-1 text-[13px] text-muted">
        or{" "}
        <span className="font-medium text-accent underline-offset-4 group-hover:underline">
          browse your device
        </span>{" "}
        — drop as many as you like
      </p>
    </div>
  );
}
