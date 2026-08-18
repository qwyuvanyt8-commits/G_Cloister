"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev.slice(-3), { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="pointer-events-auto flex w-full items-center gap-3 border-2 border-gc-ink bg-paper px-4 py-3 shadow-[4px_4px_0_var(--gc-shadow)]"
            >
              {t.kind === "success" && <CheckCircle size={20} weight="duotone" className="shrink-0 text-gc-cobalt" />}
              {t.kind === "error" && <WarningCircle size={20} weight="duotone" className="shrink-0 text-gc-orange" />}
              {t.kind === "info" && <Info size={20} weight="duotone" className="shrink-0 text-gc-muted" />}
              <p className="font-space-mono text-[12px] font-bold uppercase tracking-[0.03em] leading-snug text-gc-ink">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
