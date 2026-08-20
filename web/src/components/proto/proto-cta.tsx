"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/cn";

export function useProtoStart() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const start = () => {
    if (user) router.push("/home");
    else setShowAuth(true);
  };

  return {
    start,
    showAuth,
    setShowAuth,
    hostLabel: loading ? "Opening door" : user ? "Go to rooms" : "Host a room",
    user,
  };
}

export function ProtoCtas({
  mode = "dark",
  radius = "pill",
  primaryClassName,
  secondaryClassName,
}: {
  mode?: "dark" | "light";
  radius?: "pill" | "sharp";
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  const { start, showAuth, setShowAuth, hostLabel } = useProtoStart();

  const r = radius === "sharp" ? "rounded-none" : "rounded-full";

  const primary = cn(
    "inline-flex h-12 items-center justify-center gap-2 bg-proto-accent px-7 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-proto-accent-strong active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-proto-accent",
    r
  );

  const secondary = cn(
    "inline-flex h-12 items-center justify-center gap-2 border px-7 text-[15px] font-semibold transition-all duration-150 hover:-translate-y-px active:translate-y-px active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-proto-accent",
    r,
    mode === "dark"
      ? "border-white/20 text-white/90 hover:border-white/40 hover:text-white"
      : "border-[#0c0f14]/25 text-[#0c0f14] hover:border-proto-accent hover:text-proto-accent"
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={start} className={cn(primary, primaryClassName)}>
          {hostLabel}
        </button>
        <button type="button" onClick={start} className={cn(secondary, secondaryClassName)}>
          Join with a code <ArrowRight size={16} weight="bold" />
        </button>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}