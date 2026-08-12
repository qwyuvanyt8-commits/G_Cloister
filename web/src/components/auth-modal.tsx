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
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl sm:p-7"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <Logo size={30} withWordmark={false} />
              <span className="font-mono text-[16px] font-semibold tracking-tight text-ink">
                G<span className="text-accent">_</span>Cloister
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Hosts sign in with Google to store room files in their Drive. Members can
              join with just an email — no Google account needed.
            </p>

            <div className="mt-5 space-y-4">
              <Button
                size="lg"
                className="w-full"
                variant="secondary"
                loading={googleLoading}
                onClick={handleGoogle}
                icon={!googleLoading && <GoogleLogo size={18} weight="bold" />}
              >
                Continue with Google
              </Button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-faint">
                  or use email
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="flex rounded-xl border border-border bg-surface-2 p-1">
                {(["signin", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                      mode === m
                        ? "bg-surface text-ink shadow-sm ring-1 ring-border-strong"
                        : "text-muted hover:text-ink"
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
                    icon={<UserCircle size={18} className="text-faint" />}
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
                  icon={<Envelope size={18} className="text-faint" />}
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
                    icon={<LockKey size={18} className="text-faint" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {mode === "register" && (
                    <p className="mt-1.5 text-[12px] text-faint">At least 6 characters.</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-danger/30 bg-danger-soft/60 px-3.5 py-2.5 text-[13px] text-danger">
                    {error}
                  </div>
                )}

                <Button size="lg" className="w-full" loading={submitting} type="submit">
                  {mode === "register" ? "Create account" : "Sign in"}
                </Button>
              </form>

              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 py-3">
                <GoogleDriveLogo size={17} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[12.5px] leading-snug text-muted">
                  A Google account is only required to <span className="font-medium text-ink">host</span> a
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