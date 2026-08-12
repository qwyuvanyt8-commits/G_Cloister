"use client";

import { useEffect, useState, useMemo, use } from "react";
import { notFound } from "next/navigation";
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
} from "@phosphor-icons/react";
import { Button, Input, Logo } from "@/components/ui";
import { useToast } from "@/components/toast";
import {
  api,
  AdminUser,
  getAdminToken,
  setAdminToken,
  removeAdminToken,
} from "@/lib/api";
import { timeAgo } from "@/lib/format";

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

  // Admin Dashboard data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [authFilter, setAuthFilter] = useState<"all" | "google" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  // Room details modal per user
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      } catch {
        removeAdminToken();
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

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
        toast(`Banned ${user.name || user.email}. Active sessions ended.`, "error");
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
        toast(`Kicked user from room ${roomId}`, "error");
      }
      await fetchUsers();
      // Refresh modal selectedUser if open
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

    const allRoomIds = new Set<string>();
    users.forEach((u) => u.joinedRooms.forEach((r) => allRoomIds.add(r.roomId)));

    return { total, googleCount, emailCount, bannedCount, roomsCount: allRoomIds.size };
  }, [users]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="animate-spin text-accent" />
          <span className="text-[14px]">Verifying admin authorization…</span>
        </div>
      </div>
    );
  }

  // ---- Render Admin Login Screen ----
  if (!authenticated) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-7 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Logo size={28} withWordmark={false} />
              <span className="font-mono text-[15px] font-semibold text-ink">
                G<span className="text-accent">_</span>Cloister
              </span>
            </div>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium text-accent">
              ADMIN GATEWAY
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-ink">
              <ShieldCheck size={22} className="text-accent" />
              <h1 className="text-lg font-semibold tracking-tight">Admin System Sign-In</h1>
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Restricted management console. Authorized administrators only.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              icon={<Envelope size={18} className="text-faint" />}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              label="Admin Password"
              type="password"
              placeholder="••••••••••••"
              icon={<LockKey size={18} className="text-faint" />}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />

            {loginError && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft/60 px-3.5 py-2.5 text-[13px] text-danger">
                <Warning size={18} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <Button size="lg" className="w-full" loading={loggingIn} type="submit">
              Authenticate Admin Session
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-3.5 text-[12px] leading-relaxed text-muted">
            <div className="flex items-center gap-2 font-medium text-ink">
              <EyeClosed size={16} className="text-accent" />
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
    <div className="min-h-screen bg-background text-ink">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={28} withWordmark={false} />
            <span className="font-mono text-[16px] font-semibold text-ink">
              G<span className="text-accent">_</span>Cloister
            </span>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-accent">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted">
              <ShieldCheck size={15} className="text-accent" />
              <span>{adminEmail || "admin@example.com"}</span>
            </div>
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
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 p-4 text-[13px]">
          <div className="flex items-center gap-3">
            <EyeClosed size={22} className="shrink-0 text-accent" />
            <div>
              <p className="font-semibold text-ink">User File Privacy Enforced</p>
              <p className="text-muted">
                Admin controls monitor identity, auth methods, and room memberships only. All room files remain strictly private.
              </p>
            </div>
          </div>
          <span className="hidden rounded-lg bg-surface px-3 py-1 font-mono text-[11px] font-medium text-muted sm:inline-block">
            ZERO_FILE_ACCESS
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12.5px] font-medium">Total Users</span>
              <Users size={18} className="text-accent" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12.5px] font-medium">Google Auth</span>
              <GoogleLogo size={18} className="text-blue-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{stats.googleCount}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12.5px] font-medium">Email Auth</span>
              <Envelope size={18} className="text-purple-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{stats.emailCount}</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12.5px] font-medium">Banned Users</span>
              <ShieldWarning size={18} className="text-danger" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{stats.bannedCount}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[12.5px] font-medium">Active Rooms</span>
              <Door size={18} className="text-accent" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{stats.roomsCount}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={17} className="absolute left-3.5 top-3 text-faint" />
            <input
              type="text"
              placeholder="Search by name, email, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex rounded-xl border border-border bg-surface p-1">
              {(["all", "google", "email"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAuthFilter(m)}
                  className={`rounded-lg px-3 py-1 text-[12.5px] font-medium capitalize transition-colors ${
                    authFilter === m ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {m === "all" ? "All Auth" : m}
                </button>
              ))}
            </div>

            <div className="flex rounded-xl border border-border bg-surface p-1">
              {(["all", "active", "banned"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-1 text-[12.5px] font-medium capitalize transition-colors ${
                    statusFilter === s ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={fetchUsers}
              loading={loadingUsers}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-border bg-surface-2 text-[12px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">User Identity</th>
                  <th className="px-5 py-3">Login Method</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3">Rooms</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-surface-2/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            // eslint-disable-next-next/no-img-element
                            <img
                              src={u.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-mono text-[13px] font-semibold text-accent">
                              {(u.name || u.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-ink">{u.name}</p>
                            <p className="font-mono text-[12px] text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {u.authType === "google" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11.5px] font-medium text-blue-400">
                            <GoogleLogo size={14} />
                            Google OAuth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11.5px] font-medium text-purple-400">
                            <Envelope size={14} />
                            Email / Password
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-muted">
                        {timeAgo(u.createdAt)}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                        >
                          <Door size={14} />
                          <span>{u.joinedRooms.length} Room{u.joinedRooms.length !== 1 ? "s" : ""}</span>
                        </button>
                      </td>

                      <td className="px-5 py-3.5">
                        {u.banned ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger-soft/60 px-2.5 py-0.5 text-[11.5px] font-medium text-danger">
                            <ShieldWarning size={13} />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[11.5px] font-medium text-accent">
                            <CheckCircle size={13} />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant={u.banned ? "secondary" : "danger"}
                          loading={actionLoading === u.id}
                          onClick={() => handleBanToggle(u)}
                          icon={u.banned ? <UserCheck size={14} /> : <UserMinus size={14} />}
                        >
                          {u.banned ? "Unban User" : "Ban User"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Joined Rooms Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Joined Rooms Overview</h3>
                <p className="text-[12.5px] text-muted">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-3">
              {selectedUser.joinedRooms.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted">
                  This user has not joined any rooms yet.
                </p>
              ) : (
                selectedUser.joinedRooms.map((r) => {
                  const key = `${selectedUser.id}-${r.roomId}`;
                  return (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-ink">
                            {r.roomId}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium ${
                              r.isHost
                                ? "bg-accent/10 text-accent border border-accent/20"
                                : "bg-surface text-muted border border-border"
                            }`}
                          >
                            {r.isHost ? "Host" : "Member"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] text-faint">
                          Joined {timeAgo(r.joinedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.kicked ? (
                          <span className="text-[11.5px] font-medium text-danger">Kicked</span>
                        ) : null}
                        <Button
                          size="sm"
                          variant={r.kicked ? "secondary" : "danger"}
                          loading={actionLoading === key}
                          onClick={() => handleKickToggle(selectedUser.id, r.roomId, r.kicked)}
                        >
                          {r.kicked ? "Unkick" : "Kick"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 border-t border-border pt-4 text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
