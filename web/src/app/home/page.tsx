"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { PlusCircle, SignIn, ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import { AppNav } from "@/components/app-nav";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";

function HomeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const auth = params.get("auth");
    if (auth === "success") toast("Signed in. Welcome back.");
    else if (auth === "error") toast("Sign-in didn't complete. Please try again.", "error");
  }, [params, toast]);

  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <div className="aurora pointer-events-none fixed inset-x-0 top-0 h-[80vh]" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-16 lg:px-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-faint">
            Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            What will you open <span className="text-accent">today</span>?
          </h1>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Host */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/host")}
            className="group relative overflow-hidden rounded-3xl border border-accent-border bg-accent-soft p-8 text-left transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-[#04120c]">
              <PlusCircle size={24} weight="bold" />
            </span>
            <h2 className="relative mt-6 text-2xl font-semibold tracking-tight text-ink">Host a room</h2>
            <p className="relative mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              Pick a room ID. Your Google Drive becomes the vault with a fresh 5&nbsp;GB to fill.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Create a room <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          {/* Join */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push("/join")}
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 text-left transition-transform duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink ring-1 ring-border">
              <SignIn size={24} weight="duotone" />
            </span>
            <h2 className="relative mt-6 text-2xl font-semibold tracking-tight text-ink">Join a room</h2>
            <p className="relative mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              Got a code and a password from a host? Step inside and see their files appear live.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors group-hover:text-accent">
              Enter with a code <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 flex items-center gap-2 text-[13px] text-faint"
        >
          <GoogleLogo size={14} />
          All rooms run on your own Google Drive — nothing is hosted on third-party servers.
        </motion.p>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <AppNav />
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
    </RequireAuth>
  );
}
