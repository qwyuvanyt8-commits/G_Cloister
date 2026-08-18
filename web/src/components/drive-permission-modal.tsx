"use client";

import { motion, AnimatePresence } from "motion/react";
import { Warning, ArrowSquareOut, X, CheckCircle } from "@phosphor-icons/react";
import { Button } from "./ui";
import { useAuth } from "./auth-provider";

export interface DrivePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function DrivePermissionModal({
  isOpen,
  onClose,
  title = "Google Drive Access Required",
  description = "G_Cloister needs permission to manage files on your Google Drive to host rooms or sync files. It looks like the Drive permission checkbox was unchecked during Google sign-in.",
}: DrivePermissionModalProps) {
  const { signOut, signIn } = useAuth();

  const handleFixPermissions = async () => {
    await signOut();
    signIn();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden border-4 border-gc-ink bg-paper p-6 shadow-[8px_8px_0_#16130d]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border-2 border-gc-ink bg-paper text-gc-muted transition-colors hover:bg-gc-ink hover:text-paper"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-gc-orange bg-gc-orange/10 text-gc-orange">
                <Warning size={26} weight="duotone" />
              </div>
              <div className="pr-6">
                <h3 className="text-xl font-black tracking-tight uppercase">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-gc-muted">{description}</p>
              </div>
            </div>

            {/* Instruction Steps Box */}
            <div className="mt-5 border-2 border-dashed border-gc-ink bg-paper-2 p-4 space-y-3">
              <p className="font-space-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gc-ink">How to resolve this:</p>
              
              <div className="flex items-start gap-2.5 text-[13.5px] text-gc-muted">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-gc-ink bg-gc-cobalt text-paper font-space-mono text-[11px] font-bold">1</span>
                <span>Click <strong>Sign Out & Fix Permissions</strong> below.</span>
              </div>

              <div className="flex items-start gap-2.5 text-[13.5px] text-gc-muted">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-gc-ink bg-gc-cobalt text-paper font-space-mono text-[11px] font-bold">2</span>
                <span>On the Google sign-in screen, ensure you <strong>check the permission box</strong>:</span>
              </div>

              <div className="ml-7 border-2 border-gc-cobalt bg-gc-cobalt/5 p-3 text-[12.5px] text-gc-ink flex items-start gap-2">
                <CheckCircle size={16} className="text-gc-cobalt shrink-0 mt-0.5" weight="fill" />
                <span><em>"See, edit, create, and delete only the specific Google Drive files you use with this app"</em></span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleFixPermissions}
                icon={<ArrowSquareOut size={18} weight="bold" />}
              >
                Sign Out & Fix Permissions
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
