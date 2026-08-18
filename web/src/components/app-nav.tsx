"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SignOut, LockKey } from "@phosphor-icons/react";
import { Logo, Avatar, IconButton } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppNav({ backTo }: { backTo?: string }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-gc-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-6">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1.5 border-2 border-gc-ink bg-paper-2 px-2 py-1 font-space-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-gc-cobalt md:flex">
                <LockKey size={12} weight="bold" />
                room keys guarded
              </span>
              <div className="flex items-center gap-2 border-2 border-gc-ink bg-paper py-1 pl-1 pr-2 shadow-[3px_3px_0_var(--gc-shadow)]">
                <Avatar name={user.name} src={user.avatar} size={26} />
                <span className="hidden text-[13px] font-extrabold uppercase tracking-tight text-gc-ink sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                  className="flex items-center gap-1 text-[13px] font-bold text-gc-muted transition-colors hover:text-gc-orange"
                  aria-label="Sign out"
                >
                  <SignOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
