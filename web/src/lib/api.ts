import type { PublicUser, Room, RoomWithPassword } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_URL = API;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
}): Promise<{ id: string; name: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/rooms/${opts.roomId}/files`);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(opts.file.name));
    xhr.setRequestHeader("Content-Type", opts.file.type || "application/octet-stream");
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
        resolve({ id: String(body.id ?? ""), name: String(body.name ?? opts.file.name) });
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
  createRoom: (roomId: string) =>
    request<RoomWithPassword>("/api/rooms", { method: "POST", body: JSON.stringify({ roomId }) }),
  joinRoom: (roomId: string, password: string) =>
    request<Room>("/api/rooms/join", {
      method: "POST",
      body: JSON.stringify({ roomId, password }),
    }),
  getRoom: (roomId: string) => request<Room>(`/api/rooms/${roomId}`),
  deleteFile: (roomId: string, fileId: string) =>
    request<{ id: string; deleted: boolean }>(`/api/rooms/${roomId}/files/${fileId}`, {
      method: "DELETE",
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
};

export const authUrl = `${API}/api/auth/google`;
