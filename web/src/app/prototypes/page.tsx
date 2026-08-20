"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { ProtoSwitcher } from "@/components/proto/proto-switcher";
import { cn } from "@/lib/cn";

const PROTOS = [
  {
    id: "a",
    name: "A · Signal",
    tag: "Dark, Linear-grade minimal",
    read: "Calm-minimalist language over near-black surfaces with a single cobalt accent. Built for technical and design-literate users.",
    palette: ["#090b0f", "#0c1016", "#5a6cff", "#eef1f6"],
    swatch: "bg-[#090b0f]",
  },
  {
    id: "b",
    name: "B · Index",
    tag: "Light, calm enterprise",
    read: "Trust-forward editorial language over a white + hairline system, sharp corners and restrained motion. Built for privacy-sensitive teams.",
    palette: ["#ffffff", "#f7f8fa", "#1e3bf3", "#0c0f14"],
    swatch: "bg-white",
  },
  {
    id: "c",
    name: "C · Poster",
    tag: "Bold, brand-forward graphic",
    read: "High-contrast neutral base, oversized display type and a single cobalt used as a full color block. Built for a confident community brand.",
    palette: ["#fbfbfa", "#0b0d12", "#1e3bf3", "#ffffff"],
    swatch: "bg-[#fbfbfa]",
  },
];

export default function PrototypesPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0b0d12] text-[#eef1f6] antialiased">
      <div className="mx-auto max-w-[980px] px-6 py-20 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7c8bff]">
          Design direction review
        </p>
        <h1 className="mt-4 text-balance text-[clamp(34px,5vw,60px)] font-semibold leading-[1.0] tracking-[-0.04em]">
          Three landing pages,
          <br />
          one product.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-[#98a0ad]">
          Each direction keeps the same brand token: private rooms, real-time
          sync, storage on the host's Google Drive. What changes is the voice,
          the layout and the feel. Open each one, then pick the direction.
        </p>

        <div className="mt-14 flex flex-col gap-5">
          {PROTOS.map((p, i) => (
            <Link
              key={p.id}
              href={`/prototypes/${p.id}`}
              className={cn(
                "group grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05] sm:grid-cols-[140px_1fr_auto] sm:items-center",
                i > 0 && "md:mt-6"
              )}
            >
              <span
                className={cn(
                  "flex h-[92px] items-end justify-start rounded-xl border border-white/15 p-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]",
                  p.swatch
                )}
              >
                <span className="flex gap-1.5">
                  {p.palette.map((c) => (
                    <span
                      key={c}
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ background: c }}
                    />
                  ))}
                </span>
              </span>
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">{p.name}</h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#7c8bff]">
                  {p.tag}
                </p>
                <p className="mt-2.5 max-w-[58ch] text-[14.5px] leading-relaxed text-[#98a0ad]">
                  {p.read}
                </p>
              </div>
              <span className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#98a0ad] transition-all duration-200 group-hover:border-white/40 group-hover:text-white sm:inline-flex">
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-[#5b6472]">
          The current shipped landing stays live at{" "}
          <Link href="/" className="text-[#7c8bff] underline-offset-4 hover:underline">
            /
          </Link>{" "}
          if you want to compare against it.
        </p>
      </div>
      <ProtoSwitcher />
    </main>
  );
}