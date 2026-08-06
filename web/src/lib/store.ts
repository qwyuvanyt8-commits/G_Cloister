"use client";

import { create } from "zustand";
import type { Room, RoomFile, RoomMember } from "./types";

interface RoomState {
  room: Room | null;
  connected: boolean;
  setRoom: (room: Room) => void;
  patchUsage: (usedBytes: number) => void;
  addFile: (file: RoomFile) => void;
  updateFile: (id: string, patch: Partial<RoomFile>) => void;
  removeFile: (id: string) => void;
  setMembers: (members: RoomMember[]) => void;
  upsertMember: (member: RoomMember) => void;
  removeMember: (userId: string) => void;
  setMemberPresence: (userId: string, online: boolean) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  connected: false,
  setRoom: (room) => set({ room }),
  patchUsage: (usedBytes) =>
    set((s) => {
      if (!s.room) return {};
      const limitBytes = s.room.usage.limitBytes;
      return {
        room: {
          ...s.room,
          usage: {
            ...s.room.usage,
            usedBytes: Math.max(0, usedBytes),
            usedFormatted: formatUsage(usedBytes),
            percent: Math.min(100, (usedBytes / limitBytes) * 100),
          },
        },
      };
    }),
  addFile: (file) =>
    set((s) => {
      if (!s.room) return {};
      const exists = s.room.files.some((f) => f.id === file.id);
      return {
        room: {
          ...s.room,
          files: exists ? s.room.files : [file, ...s.room.files],
        },
      };
    }),
  updateFile: (id, patch) =>
    set((s) => {
      if (!s.room) return {};
      return {
        room: {
          ...s.room,
          files: s.room.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        },
      };
    }),
  removeFile: (id) =>
    set((s) => {
      if (!s.room) return {};
      return { room: { ...s.room, files: s.room.files.filter((f) => f.id !== id) } };
    }),
  setMembers: (members) =>
    set((s) => (s.room ? { room: { ...s.room, members } } : {})),
  upsertMember: (member) =>
    set((s) => {
      if (!s.room) return {};
      const exists = s.room.members.some((m) => m.id === member.id);
      return {
        room: {
          ...s.room,
          members: exists
            ? s.room.members.map((m) => (m.id === member.id ? { ...m, ...member, online: true, left: false } : m))
            : [...s.room.members, { ...member, online: true, left: false }],
        },
      };
    }),
  removeMember: (userId) =>
    set((s) => {
      if (!s.room) return {};
      return {
        room: {
          ...s.room,
          members: s.room.members.map((m) =>
            m.id === userId ? { ...m, online: false, left: true } : m
          ),
        },
      };
    }),
  setMemberPresence: (userId: string, online: boolean) =>
    set((s) => {
      if (!s.room) return {};
      return {
        room: {
          ...s.room,
          members: s.room.members.map((m) =>
            m.id === userId ? { ...m, online } : m
          ),
        },
      };
    }),
  setConnected: (connected) => set({ connected }),
  reset: () => set({ room: null, connected: false }),
}));

function formatUsage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}
