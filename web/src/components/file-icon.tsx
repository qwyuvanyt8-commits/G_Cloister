"use client";

import {
  File,
  FileArchive,
  FileAudio,
  FileDoc,
  FileImage,
  FilePdf,
  FilePpt,
  FileText,
  FileVideo,
  FileXls,
} from "@phosphor-icons/react";
import { fileKind } from "@/lib/format";
import { cn } from "@/lib/cn";

const iconByKind: Record<string, { Icon: React.ElementType; tone: string }> = {
  image: { Icon: FileImage, tone: "text-accent" },
  pdf: { Icon: FilePdf, tone: "text-danger" },
  video: { Icon: FileVideo, tone: "text-[#5aa2ff]" },
  audio: { Icon: FileAudio, tone: "text-[#b78cff]" },
  text: { Icon: FileText, tone: "text-muted" },
  archive: { Icon: FileArchive, tone: "text-[#f0b04e]" },
  slides: { Icon: FilePpt, tone: "text-[#ff8a5c]" },
  sheet: { Icon: FileXls, tone: "text-[#4ed07a]" },
  doc: { Icon: FileDoc, tone: "text-[#5a9bff]" },
  file: { Icon: File, tone: "text-faint" },
};

export function FileIcon({
  name,
  mimeType,
  size = 20,
  className,
}: {
  name: string;
  mimeType: string;
  size?: number;
  className?: string;
}) {
  const { Icon, tone } = iconByKind[fileKind(mimeType, name)] || iconByKind.file;
  return <Icon size={size} weight="duotone" className={cn(tone, className)} />;
}
