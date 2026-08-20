"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/prototypes", label: "Overview" },
  { href: "/prototypes/a", label: "A" },
  { href: "/prototypes/b", label: "B" },
  { href: "/prototypes/c", label: "C" },
  { href: "/prototypes/d", label: "D" },
  { href: "/prototypes/e", label: "E" },
  { href: "/prototypes/f", label: "F" },
  { href: "/", label: "Live" },
];

export function ProtoSwitcher() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 right-4 z-[90] flex max-w-[calc(100vw-2rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-white/15 bg-black/75 p-1 font-mono text-[11px] tracking-wide text-white/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md [backdrop-filter:blur(8px)]">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 transition-colors",
              it.label === "D" || it.label === "E" || it.label === "F"
                ? active
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
                : active
                  ? "bg-white text-black"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}