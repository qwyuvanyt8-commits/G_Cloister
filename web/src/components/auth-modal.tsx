"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  GoogleLogo,
  Envelope,
  LockKey,
  X,
  UserCircle,
  GoogleDriveLogo,
} from "@phosphor-icons/react";
import { Button, Input, Logo } from "./ui";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast";
import { api, setStoredToken } from "@/lib/api";
import { cn } from "@/lib/cn";

type Mode = "signin" | "register";

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const { signIn, refresh } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    setError(null);
    signIn();
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res =
        mode === "register"
          ? await api.register(name.trim(), trimmedEmail, password)
          : await api.login(trimmedEmail, password);
      setStoredToken(res.token);
      await refresh();
      onClose();
      toast(mode === "register" ? "Account created. Welcome to G_Cloister!" : "Signed in. Welcome back.");
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#10131a] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] sm:p-7"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-gc-muted transition-colors hover:bg-white/[0.05] hover:text-gc-ink"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <Logo size={30} />

            <h3 className="mt-5 text-xl font-black tracking-tight">
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-gc-muted">
              Hosts sign in with Google to store room files in their Drive. Members can
              join with just an email — no Google account needed.
            </p>

            <div className="mt-5 space-y-4">
              <Button
                size="lg"
                className="w-full"
                loading={googleLoading}
                onClick={handleGoogle}
                icon={!googleLoading && <GoogleLogo size={18} weight="bold" />}
              >
                Continue with Google
              </Button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gc-faint">
                  or use email
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex rounded-full bg-white/[0.05] p-1">
                {(["signin", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition-colors",
                      mode === m
                        ? "bg-gc-cobalt text-white"
                        : "text-gc-muted hover:text-gc-ink"
                    )}
                  >
                    {m === "signin" ? "Sign in" : "New here"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleEmail} className="space-y-3">
                {mode === "register" && (
                  <Input
                    label="Name"
                    name="name"
                    autoComplete="name"
                    icon={<UserCircle size={18} />}
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                  />
                )}
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  icon={<Envelope size={18} />}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    icon={<LockKey size={18} />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {mode === "register" && (
                    <p className="mt-1.5 text-[12px] text-gc-faint">At least 6 characters.</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg border border-gc-orange/30 bg-gc-orange/10 px-3.5 py-2.5 font-mono text-[12px] uppercase tracking-[0.04em] text-gc-orange">
                    {error}
                  </div>
                )}

                <Button size="lg" className="w-full" loading={submitting} type="submit">
                  {mode === "register" ? "Create account" : "Sign in"}
                </Button>
              </form>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                <GoogleDriveLogo size={17} weight="duotone" className="mt-0.5 shrink-0 text-gc-cobalt" />
                <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.04em] text-gc-muted">
                  A Google account is only required to <span className="font-semibold text-gc-ink">host</span> a
                  room — the vault lives in the host&apos;s Drive. Joining and uploading works with any account.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}