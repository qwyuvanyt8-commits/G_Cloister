"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PublicUser } from "@/lib/types";
import { api, authUrl, setStoredToken, removeStoredToken } from "@/lib/api";
import { DrivePermissionModal } from "./drive-permission-modal";

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  hasDrive: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  openDriveModal: (title?: string, description?: string) => void;
  closeDriveModal: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  hasDrive: false,
  signIn: () => {},
  signOut: async () => {},
  refresh: async () => {},
  openDriveModal: () => {},
  closeDriveModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [modalMeta, setModalMeta] = useState<{ title?: string; description?: string }>({});

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        setStoredToken(token);
        params.delete("token");
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    }
    refresh();
  }, [refresh]);

  const signIn = useCallback(() => {
    window.location.href = authUrl;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    removeStoredToken();
    setUser(null);
  }, []);

  const openDriveModal = useCallback((title?: string, description?: string) => {
    setModalMeta({ title, description });
    setShowDriveModal(true);
  }, []);

  const closeDriveModal = useCallback(() => {
    setShowDriveModal(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        hasDrive: !!user?.hasDrive,
        signIn,
        signOut,
        refresh,
        openDriveModal,
        closeDriveModal,
      }}
    >
      {children}
      <DrivePermissionModal
        isOpen={showDriveModal}
        onClose={closeDriveModal}
        title={modalMeta.title}
        description={modalMeta.description}
      />
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
