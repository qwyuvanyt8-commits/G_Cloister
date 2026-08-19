import type { PublicUser, Room, RoomFile, RoomWithPassword } from "./types";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(
  /\/+$/,
  ""
);

export const API_URL = API;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gcl_token");
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gcl_token", token);
  }
}

export function removeStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gcl_token");
  }
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gcl_admin_token");
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gcl_admin_token", token);
  }
}

export function removeAdminToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gcl_admin_token");
  }
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  authType: "google" | "email";
  createdAt: number;
  banned: boolean;
  joinedRooms: Array<{
    roomId: string;
    role: string;
    joinedAt: number;
    left: boolean;
    kicked: boolean;
    isHost: boolean;
  }>;
}

export interface AdminRoom {
  roomId: string;
  createdAt: number;
  totalBytes: number;
  host: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  memberCount: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isAdminPath = path.startsWith("/api/admin");
  const token = isAdminPath ? getAdminToken() : getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = new Error(
      (body?.error as string) || `Request failed (${res.status})`
    ) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = body?.code as string | undefined;
    throw err;
  }
  return body as T;
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export function uploadFile(opts: {
  roomId: string;
  file: File;
  onProgress?: (p: UploadProgress) => void;
}): Promise<RoomFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/rooms/${opts.roomId}/files`);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(opts.file.name));
    xhr.setRequestHeader("Content-Type", opts.file.type || "application/octet-stream");
    const token = getStoredToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress({ loaded: e.loaded, total: e.total });
      }
    };
    xhr.onload = () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as unknown as RoomFile);
      } else {
        const err = new Error((body?.error as string) || "Upload failed") as Error & {
          status?: number;
        };
        err.status = xhr.status;
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.send(opts.file);
  });
}

export const api = {
  me: () => request<{ user: PublicUser }>("/api/auth/me"),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: PublicUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: PublicUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  createRoom: (roomId: string) =>
    request<RoomWithPassword>("/api/rooms", { method: "POST", body: JSON.stringify({ roomId }) }),
  joinRoom: (roomId: string, password: string) =>
    request<Room>("/api/rooms/join", {
      method: "POST",
      body: JSON.stringify({ roomId, password }),
    }),
  leaveRoom: (roomId: string) =>
    request<{ ok: boolean }>(`/api/rooms/${roomId}/leave`, { method: "POST" }),
  deleteRoom: (roomId: string) =>
    request<{ ok: boolean }>(`/api/rooms/${roomId}`, { method: "DELETE" }),
  forgetRoom: (roomId: string) =>
    request<{ ok: boolean }>(`/api/rooms/${roomId}/forget`, { method: "DELETE" }),
  kickMember: (roomId: string, targetUserId: string) =>
    request<{ ok: boolean }>(`/api/rooms/${roomId}/kick`, {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }),
  unkickMember: (roomId: string, targetUserId: string) =>
    request<{ ok: boolean }>(`/api/rooms/${roomId}/unkick`, {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }),
  syncToDrive: (roomId: string) =>
    request<{ ok: boolean; syncedCount: number }>(`/api/rooms/${roomId}/sync`, {
      method: "POST",
    }),
  getRoom: (roomId: string) => request<Room>(`/api/rooms/${roomId}`),
  myRooms: () =>
    request<{
      hosted: Array<{
        roomId: string;
        createdAt: number;
        usedBytes: number;
        usedFormatted: string;
        limitFormatted: string;
        memberCount: number;
        isMember?: boolean;
      }>;
      joined: Array<{
        roomId: string;
        createdAt: number;
        usedBytes: number;
        usedFormatted: string;
        limitFormatted: string;
        hostName: string;
        hostAvatar: string | null;
        memberCount: number;
      }>;
    }>("/api/rooms/my"),
  deleteFile: (roomId: string, fileId: string) =>
    request<{ id: string; deleted: boolean }>(`/api/rooms/${roomId}/files/${fileId}`, {
      method: "DELETE",
    }),
  reorderFiles: (roomId: string, fileIds: string[]) =>
    request<{ ok: boolean; fileIds: string[] }>(`/api/rooms/${roomId}/files/reorder`, {
      method: "POST",
      body: JSON.stringify({ fileIds }),
    }),
  renameFile: (roomId: string, fileId: string, name: string) =>
    request<{ id: string; name: string }>(`/api/rooms/${roomId}/files/${fileId}/rename`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  preview: (roomId: string, fileId: string) =>
    request<{ viewLink: string; contentLink: string; thumbnailLink?: string }>(
      `/api/rooms/${roomId}/files/${fileId}/preview`
    ),
  previewUrl: (roomId: string, fileId: string) =>
    `${API}/api/rooms/${roomId}/files/${fileId}/preview`,
  downloadUrl: (roomId: string, fileId: string) =>
    `${API}/api/rooms/${roomId}/files/${fileId}/download`,
  socketUrl: API,
  adminLogin: (email: string, password: string) =>
    request<{ token: string; ok: boolean }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminMe: () => request<{ ok: boolean; email: string }>("/api/admin/me"),
  adminLogout: () => request<{ ok: boolean }>("/api/admin/logout", { method: "POST" }),
  adminGetUsers: () => request<{ users: AdminUser[] }>("/api/admin/users"),
  adminBanUser: (userId: string) =>
    request<{ ok: boolean; userId: string; banned: boolean }>(`/api/admin/users/${userId}/ban`, {
      method: "POST",
    }),
  adminUnbanUser: (userId: string) =>
    request<{ ok: boolean; userId: string; banned: boolean }>(`/api/admin/users/${userId}/unban`, {
      method: "POST",
    }),
  adminKickRoomMember: (userId: string, roomId: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${userId}/rooms/${roomId}/kick`, {
      method: "POST",
    }),
  adminUnkickRoomMember: (userId: string, roomId: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${userId}/rooms/${roomId}/unkick`, {
      method: "POST",
    }),
  adminBroadcast: (message: string, level: string = "info") =>
    request<{ ok: boolean }>("/api/admin/broadcast", {
      method: "POST",
      body: JSON.stringify({ message, level }),
    }),
  adminGetRooms: () => request<{ rooms: AdminRoom[] }>("/api/admin/rooms"),
  adminDeleteRoom: (roomId: string) =>
    request<{ ok: boolean }>(`/api/admin/rooms/${roomId}`, { method: "DELETE" }),
  adminResetPassword: (userId: string, password: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  adminPurgeSessions: () => request<{ ok: boolean }>("/api/admin/sessions/purge", { method: "POST" }),
};

export const authUrl = `${API}/api/auth/google`;
