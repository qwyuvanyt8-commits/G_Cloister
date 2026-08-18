"use client";

import { createContext, useContext } from "react";

type Theme = "light";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={{ theme: "light", toggle: () => {} }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}