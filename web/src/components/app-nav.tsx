"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SignOut, LockKey } from "@phosphor-icons/react";
import { Logo, Avatar, IconButton } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

export function AppNav({ backTo }: { backTo?: string }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          {backTo && (
            <IconButton onClick={() => router.push(backTo)} aria-label="Back">
              <ArrowLeft size={19} weight="bold" />
            </IconButton>
          )}
          <Link href="/" aria-label="G_Cloister home">
            <Logo size={30} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden items-center gap-1.5 rounded-full border border-gc-cobalt/40 bg-gc-cobalt/10 px-3 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#7c8bff] md:flex">
                <LockKey size={12} weight="bold" />
                keys guarded
              </span>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2">
                <Avatar name={user.name} src={user.avatar} size={26} />
                <span className="hidden max-w-[10rem] truncate text-[13.5px] font-semibold tracking-tight text-gc-ink sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                  className="flex items-center gap-1 rounded-full px-1.5 text-gc-muted transition-colors hover:text-gc-orange"
                  aria-label="Sign out"
                >
                  <SignOut size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}