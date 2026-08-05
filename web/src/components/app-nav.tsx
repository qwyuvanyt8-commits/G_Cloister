"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SignOut, Sun, Moon } from "@phosphor-icons/react";
import { Logo, Avatar, IconButton } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";

export function AppNav({ backTo }: { backTo?: string }) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex items-center gap-3">
          {backTo && (
            <IconButton onClick={() => router.push(backTo)} aria-label="Back">
              <ArrowLeft size={19} weight="bold" />
            </IconButton>
          )}
          <Link href="/home" aria-label="G_Cloister home">
            <Logo size={30} />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <IconButton onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          {user && (
            <div className="ml-2 flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
              <Avatar name={user.name} src={user.avatar} size={28} />
              <span className="hidden text-[13px] font-medium text-ink sm:block">
                {user.name.split(" ")[0]}
              </span>
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-danger"
                aria-label="Sign out"
              >
                <SignOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
