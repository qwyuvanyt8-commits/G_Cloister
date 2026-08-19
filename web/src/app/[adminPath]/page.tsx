"use client";

import { useEffect, useState, useMemo, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldWarning,
  Users,
  GoogleLogo,
  Envelope,
  Door,
  MagnifyingGlass,
  LockKey,
  SignOut,
  UserMinus,
  UserCheck,
  Warning,
  CheckCircle,
  X,
  EyeClosed,
  Megaphone,
  Trash,
  Key,
  Broom,
  HardDrives,
  Sparkle,
} from "@phosphor-icons/react";
import { Button, Input, Logo, Spinner } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/toast";
import {
  api,
  AdminUser,
  AdminRoom,
  getAdminToken,
  setAdminToken,
  removeAdminToken,
} from "@/lib/api";
import { timeAgo, formatBytes } from "@/lib/format";

const SECRET_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";

export default function AdminPage({
  params,
}: {
  params: Promise<{ adminPath: string }>;
}) {
  const { adminPath } = use(params);

  if (adminPath !== SECRET_PATH) {
    notFound();
  }

  const { toast } = useToast();

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Tab: "users" | "rooms"
  const [activeTab, setActiveTab] = useState<"users" | "rooms">("users");

  // Admin Dashboard data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [search, setSearch] = useState("");
  const [authFilter, setAuthFilter] = useState<"all" | "google" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  // Modals & OP tools state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLevel, setBroadcastLevel] = useState<"info" | "error">("info");
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Emergency Purge state
  const [purgingSessions, setPurgingSessions] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.adminGetUsers();
      setUsers(res.users);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.adminGetRooms();
      setRooms(res.rooms);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load rooms", "error");
    } finally {
      setLoadingRooms(false);
    }
  };

  // Verify active admin session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getAdminToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        await api.adminMe();
        setAuthenticated(true);
        fetchUsers();
        fetchRooms();
      } catch {
        removeAdminToken();
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await api.adminLogin(adminEmail.trim(), adminPassword);
      setAdminToken(res.token);
      setAuthenticated(true);
      toast("Admin authenticated. Welcome back!");
      fetchUsers();
      fetchRooms();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await api.adminLogout();
    } catch {}
    removeAdminToken();
    setAuthenticated(false);
    setUsers([]);
    setRooms([]);
    setSelectedUser(null);
    toast("Admin logged out.");
  };

  const handleBanToggle = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      if (user.banned) {
        await api.adminUnbanUser(user.id);
        toast(`Unbanned ${user.name || user.email}`);
      } else {
        await api.adminBanUser(user.id);
        toast(`Banned ${user.name || user.email}. Active sessions & WebSocket terminated.`, "error");
      }
      await fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Moderation action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleKickToggle = async (userId: string, roomId: string, isKicked: boolean) => {
    setActionLoading(`${userId}-${roomId}`);
    try {
      if (isKicked) {
        await api.adminUnkickRoomMember(userId, roomId);
        toast(`Restored user in room ${roomId}`);
      } else {
        await api.adminKickRoomMember(userId, roomId);
        toast(`Kicked user from room ${roomId} in real time`, "error");
      }
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUsers = await api.adminGetUsers();
        setUsers(updatedUsers.users);
        const match = updatedUsers.users.find((u) => u.id === userId);
        if (match) setSelectedUser(match);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Room moderation failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // OP TOOL: Global Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      await api.adminBroadcast(broadcastMessage.trim(), broadcastLevel);
      toast("Global announcement broadcasted to all connected clients!", "info");
      setBroadcastMessage("");
      setShowBroadcastModal(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send broadcast", "error");
    } finally {
      setBroadcasting(false);
    }
  };

  // OP TOOL: Delete Room
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm(`Are you sure you want to delete room "${roomId}"? All members will be evacuated in real time.`)) {
      return;
    }
    setActionLoading(`room-${roomId}`);
    try {
      await api.adminDeleteRoom(roomId);
      toast(`Room "${roomId}" deleted and members evacuated.`, "info");
      fetchRooms();
      fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete room", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // OP TOOL: Reset User Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || newPassword.length < 6) return;
    setResettingPassword(true);
    try {
      await api.adminResetPassword(resetPasswordUser.id, newPassword.trim());
      toast(`Password updated for ${resetPasswordUser.email}. User sessions reset.`, "info");
      setResetPasswordUser(null);
      setNewPassword("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset password", "error");
    } finally {
      setResettingPassword(false);
    }
  };

  // OP TOOL: Emergency Session Purge
  const handlePurgeSessions = async () => {
    if (!confirm("Are you sure you want to purge all active user sessions? Users will be required to log in again.")) {
      return;
    }
    setPurgingSessions(true);
    try {
      await api.adminPurgeSessions();
      toast("All non-admin user sessions invalidated successfully.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to purge sessions", "error");
    } finally {
      setPurgingSessions(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());
      const matchAuth = authFilter === "all" || u.authType === authFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "banned" && u.banned) ||
        (statusFilter === "active" && !u.banned);
      return matchSearch && matchAuth && matchStatus;
    });
  }, [users, search, authFilter, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const googleCount = users.filter((u) => u.authType === "google").length;
    const emailCount = users.filter((u) => u.authType === "email").length;
    const bannedCount = users.filter((u) => u.banned).length;

    const totalStorageBytes = rooms.reduce((acc, r) => acc + (r.totalBytes || 0), 0);

    return { total, googleCount, emailCount, bannedCount, roomsCount: rooms.length, totalStorageBytes };
  }, [users, rooms]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-gc-muted">
        <div className="flex flex-col items-center gap-3 border-4 border-dashed border-gc-ink bg-paper paper-fiber px-8 py-10 shadow-[6px_6px_0_var(--gc-shadow)]">
          <Spinner size={26} className="text-gc-cobalt" />
          <span className="font-space-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            Verifying admin authorization…
          </span>
        </div>
      </div>
    );
  }

  // ---- Render Admin Login Screen ----
  if (!authenticated) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md border-4 border-gc-ink bg-paper paper-fiber p-7 shadow-[8px_8px_0_var(--gc-shadow)]">
          <div className="flex items-center justify-between border-b-4 border-dashed border-gc-ink/50 pb-4">
            <div className="flex items-center gap-2.5">
              <Link href="/" aria-label="G_Cloister home">
              <Logo size={28} withWordmark={false} />
            </Link>
              <span className="font-mono text-[15px] font-semibold text-gc-ink">
                G<span className="text-gc-cobalt">_</span>Cloister
              </span>
            </div>
            <span className="border-2 border-gc-cobalt bg-gc-cobalt/10 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gc-cobalt">
              ADMIN GATEWAY
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-gc-ink">
              <ShieldCheck size={22} className="text-gc-cobalt" />
              <h1 className="text-lg font-extrabold uppercase tracking-tight">Admin System Sign-In</h1>
            </div>
            <p className="mt-1 font-space-mono text-[11px] uppercase tracking-[0.08em] text-gc-muted">
              Restricted management console. Authorized administrators only.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              icon={<Envelope size={18} className="text-gc-faint" />}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              label="Admin Password"
              type="password"
              placeholder="••••••••••••"
              icon={<LockKey size={18} className="text-gc-faint" />}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />

            {loginError && (
              <div className="flex items-center gap-2 border-2 border-gc-orange bg-gc-orange/10 px-3.5 py-2.5 text-[13px] text-gc-orange">
                <Warning size={18} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <Button size="lg" className="w-full" loading={loggingIn} type="submit">
              Authenticate Admin Session
            </Button>
          </form>

          <div className="mt-6 border-2 border-dashed border-gc-ink bg-paper-2 p-3.5 text-[12px] leading-relaxed text-gc-muted">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-tight text-gc-ink">
              <EyeClosed size={16} className="text-gc-cobalt" />
              <span>Strict Privacy Policy Active</span>
            </div>
            <p className="mt-1">
              Room file data, file lists, and Drive contents are strictly isolated and not accessible from this console.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Render Admin Dashboard ----
  return (
    <div className="min-h-screen bg-background text-gc-ink">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b-4 border-gc-ink bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={28} withWordmark={false} />
            <span className="font-mono text-[16px] font-semibold text-gc-ink">
              G<span className="text-gc-cobalt">_</span>Cloister
            </span>
            <span className="flex items-center gap-1 border-2 border-gc-ink bg-gc-cobalt px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-paper shadow-[2px_2px_0_var(--gc-shadow)]">
              <Sparkle size={12} weight="bold" />
              SUPER ADMIN CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Button
              size="sm"
              variant="secondary"
              icon={<Megaphone size={15} className="text-gc-cobalt" />}
              onClick={() => setShowBroadcastModal(true)}
            >
              Broadcast Alert
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={<Broom size={15} className="text-gc-orange" />}
              loading={purgingSessions}
              onClick={handlePurgeSessions}
            >
              Purge Sessions
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={<SignOut size={15} />}
              onClick={handleAdminLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Privacy Notice Banner */}
        <div className="mb-6 flex items-center justify-between border-2 border-gc-cobalt bg-gc-cobalt/5 paper-fiber p-4 text-[13px]">
          <div className="flex items-center gap-3">
            <EyeClosed size={22} className="shrink-0 text-gc-cobalt" />
            <div>
              <p className="font-extrabold uppercase tracking-tight text-gc-ink">User File Privacy Enforced</p>
              <p className="text-gc-muted">
                Admin controls monitor identity, auth methods, and room memberships only. All room files remain strictly private.
              </p>
            </div>
          </div>
          <span className="hidden border-2 border-dashed border-gc-ink bg-paper px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-gc-muted sm:inline-block">
            ZERO_FILE_ACCESS
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Total Users</span>
              <Users size={18} className="text-gc-cobalt" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gc-ink">{stats.total}</p>
          </div>

          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Google Auth</span>
              <GoogleLogo size={18} className="text-gc-cobalt" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gc-ink">{stats.googleCount}</p>
          </div>

          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Email Auth</span>
              <Envelope size={18} className="text-gc-orange" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gc-ink">{stats.emailCount}</p>
          </div>

          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Banned Users</span>
              <ShieldWarning size={18} className="text-gc-orange" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gc-ink">{stats.bannedCount}</p>
          </div>

          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Active Rooms</span>
              <Door size={18} className="text-gc-cobalt" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gc-ink">{stats.roomsCount}</p>
          </div>

          <div className="border-2 border-gc-ink bg-paper p-4 shadow-[3px_3px_0_var(--gc-shadow)]">
            <div className="flex items-center justify-between text-gc-muted">
              <span className="text-[12.5px] font-medium">Vault Storage</span>
              <HardDrives size={18} className="text-gc-cobalt" />
            </div>
            <p className="mt-2 text-xl font-bold text-gc-ink">{formatBytes(stats.totalStorageBytes)}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex items-center justify-between border-b-4 border-gc-ink pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 border-2 px-4 py-2 text-[13.5px] font-extrabold uppercase tracking-tight transition-all ${
                activeTab === "users"
                  ? "border-gc-ink bg-gc-ink text-paper shadow-[3px_3px_0_var(--gc-shadow)]"
                  : "border-transparent text-gc-muted hover:text-gc-ink hover:border-gc-ink/40"
              }`}
            >
              <Users size={16} weight={activeTab === "users" ? "fill" : "regular"} />
              <span>Users Management ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center gap-2 border-2 px-4 py-2 text-[13.5px] font-extrabold uppercase tracking-tight transition-all ${
                activeTab === "rooms"
                  ? "border-gc-ink bg-gc-ink text-paper shadow-[3px_3px_0_var(--gc-shadow)]"
                  : "border-transparent text-gc-muted hover:text-gc-ink hover:border-gc-ink/40"
              }`}
            >
              <Door size={16} weight={activeTab === "rooms" ? "fill" : "regular"} />
              <span>Active Rooms ({rooms.length})</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              fetchUsers();
              fetchRooms();
            }}
            loading={loadingUsers || loadingRooms}
          >
            Refresh System
          </Button>
        </div>

        {/* ---- TAB 1: USERS MANAGEMENT ---- */}
        {activeTab === "users" && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass size={17} className="absolute left-3.5 top-3 text-gc-faint" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-2 border-gc-ink bg-paper py-2 pl-9 pr-4 text-[13.5px] text-gc-ink placeholder:text-gc-faint focus:border-gc-cobalt focus:outline-none focus:ring-2 focus:ring-gc-cobalt/25"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border-2 border-gc-ink bg-paper p-1">
                  {(["all", "google", "email"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAuthFilter(m)}
                      className={`px-3 py-1 text-[12.5px] font-bold uppercase tracking-tight transition-colors ${
                        authFilter === m ? "bg-gc-cobalt text-paper" : "text-gc-muted hover:text-gc-ink"
                      }`}
                    >
                      {m === "all" ? "All Auth" : m}
                    </button>
                  ))}
                </div>

                <div className="flex border-2 border-gc-ink bg-paper p-1">
                  {(["all", "active", "banned"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 text-[12.5px] font-bold uppercase tracking-tight transition-colors ${
                        statusFilter === s ? "bg-gc-ink text-paper" : "text-gc-muted hover:text-gc-ink"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden border-4 border-gc-ink bg-paper paper-fiber shadow-[5px_5px_0_var(--gc-shadow)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="border-b-4 border-gc-ink bg-paper-2 text-[12px] font-bold text-gc-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">User Identity</th>
                      <th className="px-5 py-3">Login Method</th>
                      <th className="px-5 py-3">Joined Date</th>
                      <th className="px-5 py-3">Rooms</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions & Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-dashed divide-gc-ink/20">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gc-muted">
                          No users match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="transition-colors hover:bg-paper-2/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                // eslint-disable-next-next/no-img-element
                                <img
                                  src={u.avatar}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover border-2 border-gc-ink"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-2 font-mono text-[13px] font-semibold text-gc-cobalt">
                                  {(u.name || u.email)[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gc-ink">{u.name}</p>
                                <p className="font-mono text-[12px] text-gc-muted">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            {u.authType === "google" ? (
                              <span className="inline-flex items-center gap-1.5 border-2 border-gc-cobalt bg-gc-cobalt/10 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-tight text-gc-cobalt">
                                <GoogleLogo size={14} />
                                Google OAuth
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 border-2 border-gc-orange bg-gc-orange/10 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-tight text-gc-orange">
                                <Envelope size={14} />
                                Email / Password
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-gc-muted">
                            {timeAgo(u.createdAt)}
                          </td>

                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="inline-flex items-center gap-1.5 border-2 border-gc-ink bg-paper-2 px-2.5 py-1 text-[12px] font-bold uppercase tracking-tight text-gc-ink transition-colors hover:border-gc-cobalt hover:text-gc-cobalt"
                            >
                              <Door size={14} />
                              <span>{u.joinedRooms.length} Room{u.joinedRooms.length !== 1 ? "s" : ""}</span>
                            </button>
                          </td>

                          <td className="px-5 py-3.5">
                            {u.banned ? (
                              <span className="inline-flex items-center gap-1 border-2 border-gc-orange bg-gc-orange/10 px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-tight text-gc-orange">
                                <ShieldWarning size={13} />
                                Banned
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 border-2 border-gc-cobalt bg-gc-cobalt/10 px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-tight text-gc-cobalt">
                                <CheckCircle size={13} />
                                Active
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.authType === "email" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={<Key size={14} />}
                                  onClick={() => setResetPasswordUser(u)}
                                >
                                  Reset PW
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={u.banned ? "secondary" : "danger"}
                                loading={actionLoading === u.id}
                                onClick={() => handleBanToggle(u)}
                                icon={u.banned ? <UserCheck size={14} /> : <UserMinus size={14} />}
                              >
                                {u.banned ? "Unban" : "Ban"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB 2: ACTIVE ROOMS ---- */}
        {activeTab === "rooms" && (
          <div className="mt-4 space-y-4">
            <div className="overflow-hidden border-4 border-gc-ink bg-paper paper-fiber shadow-[5px_5px_0_var(--gc-shadow)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="border-b-4 border-gc-ink bg-paper-2 text-[12px] font-bold text-gc-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Room Identifier</th>
                      <th className="px-5 py-3">Room Host</th>
                      <th className="px-5 py-3">Host Drive Storage Used</th>
                      <th className="px-5 py-3">Active Members</th>
                      <th className="px-5 py-3">Created</th>
                      <th className="px-5 py-3 text-right">Force Evacuate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-dashed divide-gc-ink/20">
                    {rooms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gc-muted">
                          No active rooms found in the system database.
                        </td>
                      </tr>
                    ) : (
                      rooms.map((r) => (
                        <tr key={r.roomId} className="transition-colors hover:bg-paper-2/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <Door size={16} className="text-gc-cobalt shrink-0" />
                              <span className="font-mono font-semibold text-gc-ink">{r.roomId}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div>
                              <p className="font-medium text-gc-ink">{r.host.name}</p>
                              <p className="font-mono text-[12px] text-gc-muted">{r.host.email}</p>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 font-mono text-gc-muted">
                            {formatBytes(r.totalBytes)}
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 border-2 border-dashed border-gc-ink bg-paper-2 px-2.5 py-0.5 text-[12px] font-bold uppercase tracking-tight text-gc-ink">
                              <Users size={13} />
                              {r.memberCount} member{r.memberCount !== 1 ? "s" : ""}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-gc-muted">
                            {timeAgo(r.createdAt)}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="danger"
                              loading={actionLoading === `room-${r.roomId}`}
                              onClick={() => handleDeleteRoom(r.roomId)}
                              icon={<Trash size={14} />}
                            >
                              Delete Room
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---- User Joined Rooms Modal ---- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden border-4 border-gc-ink bg-paper paper-fiber p-6 shadow-[8px_8px_0_var(--gc-shadow)] max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-dashed border-gc-ink/50 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gc-ink">Joined Rooms Overview</h3>
                <p className="text-[12.5px] text-gc-muted">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-none p-2 text-gc-muted hover:bg-paper-2 hover:text-gc-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-3">
              {selectedUser.joinedRooms.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-gc-muted">
                  This user has not joined any rooms yet.
                </p>
              ) : (
                selectedUser.joinedRooms.map((r) => {
                  const key = `${selectedUser.id}-${r.roomId}`;
                  return (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between border-2 border-gc-ink bg-paper-2 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gc-ink">
                            {r.roomId}
                          </span>
                          <span
                            className={`border-2 px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-tight ${
                              r.isHost
                                ? "border-gc-ink bg-gc-cobalt text-paper"
                                : "border-gc-ink bg-paper text-gc-muted"
                            }`}
                          >
                            {r.isHost ? "Host" : "Member"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] text-gc-faint">
                          Joined {timeAgo(r.joinedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.kicked ? (
                          <span className="text-[11.5px] font-medium text-gc-orange">Kicked</span>
                        ) : null}
                        <Button
                          size="sm"
                          variant={r.kicked ? "secondary" : "danger"}
                          loading={actionLoading === key}
                          onClick={() => handleKickToggle(selectedUser.id, r.roomId, r.kicked)}
                        >
                          {r.kicked ? "Unkick" : "Kick Real-time"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 border-t-2 border-dashed border-gc-ink/40 pt-4 text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---- OP TOOL: Global Broadcast Modal ---- */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowBroadcastModal(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden border-4 border-gc-ink bg-paper paper-fiber p-6 shadow-[8px_8px_0_var(--gc-shadow)] max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-dashed border-gc-ink/50 pb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={20} className="text-gc-cobalt" />
                <h3 className="text-lg font-semibold text-gc-ink">Global System Broadcast</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="rounded-none p-2 text-gc-muted hover:bg-paper-2 hover:text-gc-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="text-[12.5px] font-medium text-gc-muted">Announcement Message</label>
                <textarea
                  placeholder="Enter message to broadcast to all connected users in real time…"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  rows={3}
                  className="mt-1.5 w-full border-2 border-gc-ink bg-paper p-3 text-[13.5px] text-gc-ink placeholder:text-gc-faint focus:border-gc-cobalt focus:outline-none focus:ring-2 focus:ring-gc-cobalt/25"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-gc-muted">Alert Level</label>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastLevel("info")}
                    className={`flex-1 border-2 p-2 text-[12.5px] font-bold uppercase tracking-tight transition-colors ${
                      broadcastLevel === "info"
                        ? "border-gc-ink bg-gc-cobalt text-paper"
                        : "border-gc-ink bg-paper text-gc-muted hover:text-gc-ink"
                    }`}
                  >
                    Information (Green)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastLevel("error")}
                    className={`flex-1 border-2 p-2 text-[12.5px] font-bold uppercase tracking-tight transition-colors ${
                      broadcastLevel === "error"
                        ? "border-gc-ink bg-gc-orange text-paper"
                        : "border-gc-ink bg-paper text-gc-muted hover:text-gc-ink"
                    }`}
                  >
                    Alert Warning (Red)
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={broadcasting} className="flex-1" icon={<Megaphone size={16} />}>
                  Send Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- OP TOOL: Reset User Password Modal ---- */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setResetPasswordUser(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden border-4 border-gc-ink bg-paper paper-fiber p-6 shadow-[8px_8px_0_var(--gc-shadow)] max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-dashed border-gc-ink/50 pb-4">
              <div className="flex items-center gap-2">
                <Key size={20} className="text-gc-cobalt" />
                <h3 className="text-lg font-semibold text-gc-ink">Reset User Password</h3>
              </div>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="rounded-none p-2 text-gc-muted hover:bg-paper-2 hover:text-gc-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div className="border-2 border-dashed border-gc-ink bg-paper-2 p-3 text-[12.5px] text-gc-muted">
                Resetting password for: <span className="font-semibold text-gc-ink">{resetPasswordUser.email}</span>
              </div>

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min 6 chars)"
                icon={<LockKey size={18} className="text-gc-faint" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <div className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setResetPasswordUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={resettingPassword} className="flex-1" icon={<Key size={16} />}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
