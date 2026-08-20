"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ToastProvider, useToast } from "@/components/toast";
import { KickBanModal, KickInfo } from "@/components/kick-ban-modal";
import { getSocket, closeSocket } from "@/lib/socket";
import { removeStoredToken } from "@/lib/api";

function GlobalSocketListener({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [bannedReason, setBannedReason] = useState<string | null>(null);
  const [kickInfo, setKickInfo] = useState<KickInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleUserBanned = (payload: { error?: string }) => {
      setBannedReason(payload?.error || "Your account has been banned by an administrator.");
      removeStoredToken();
      closeSocket();
      router.push("/");
    };

    const handleRoomKicked = (payload: { roomId?: string; kickerName?: string; isHostKicker?: boolean }) => {
      const info: KickInfo = {
        roomId: payload?.roomId || "unknown",
        kickerName: payload?.kickerName || "Administrator",
        isHostKicker: !!payload?.isHostKicker,
      };
      setKickInfo(info);
      if (pathname.includes(`/room/${info.roomId}`)) {
        router.push("/home");
      }
    };

    const handleSystemBroadcast = (payload: { message?: string; level?: string }) => {
      if (payload?.message) {
        toast(payload.message, payload.level === "error" ? "error" : "info");
      }
    };

    const handleRoomDeleted = (payload: { roomId?: string }) => {
      if (payload?.roomId && pathname.includes(`/room/${payload.roomId}`)) {
        toast(`Room ${payload.roomId} has been deleted by an administrator.`, "error");
        router.push("/home");
      }
    };

    socket.on("user:banned", handleUserBanned);
    socket.on("banned", handleUserBanned);
    socket.on("room:kicked", handleRoomKicked);
    socket.on("system:broadcast", handleSystemBroadcast);
    socket.on("room:deleted", handleRoomDeleted);

    return () => {
      socket.off("user:banned", handleUserBanned);
      socket.off("banned", handleUserBanned);
      socket.off("room:kicked", handleRoomKicked);
      socket.off("system:broadcast", handleSystemBroadcast);
      socket.off("room:deleted", handleRoomDeleted);
    };
  }, [user, router, pathname, toast]);

  return (
    <>
      {children}
      <KickBanModal
        bannedReason={bannedReason}
        kickInfo={kickInfo}
        onDismissBan={() => setBannedReason(null)}
        onDismissKick={() => setKickInfo(null)}
      />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <GlobalSocketListener>{children}</GlobalSocketListener>
      </ToastProvider>
    </AuthProvider>
  );
}
