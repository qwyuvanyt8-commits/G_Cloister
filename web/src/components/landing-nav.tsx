"use client";

import { motion } from "motion/react";
import { GoogleLogo } from "@phosphor-icons/react";
import { Logo, Button } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { IconButton } from "@/components/ui";
import { Sun, Moon } from "@phosphor-icons/react";

export function LandingNav() {
  const { user, loading, signIn } = useAuth();
  const { theme, toggle } = useTheme();

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
        <Logo size={32} />

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ["How it works", "how"],
            ["Features", "features"],
            ["Privacy", "privacy"],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <IconButton onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <Button
            size="sm"
            onClick={signIn}
            loading={loading}
            icon={!loading && <GoogleLogo size={16} weight="bold" />}
          >
            {user ? "Open Cloister" : "Sign in with Google"}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
