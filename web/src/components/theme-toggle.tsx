"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-gc-ink bg-paper text-gc-ink shadow-[2px_2px_0_var(--gc-shadow)] transition-colors hover:border-gc-cobalt hover:text-gc-cobalt active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gc-cobalt"
    >
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden />
      ) : theme === "dark" ? (
        <Sun size={18} weight="bold" />
      ) : (
        <Moon size={18} weight="bold" />
      )}
    </button>
  );
}