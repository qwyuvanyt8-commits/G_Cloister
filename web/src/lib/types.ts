export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  hasDrive: boolean;
}

export interface FileUploader {
  id: string;
  name: string;
  avatar: string | null;
}

export interface RoomFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: number;
  uploader: FileUploader;
}

export interface RoomMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "host" | "member";
  online: boolean;
}

export interface RoomUsage {
  usedBytes: number;
  limitBytes: number;
  usedFormatted: string;
  limitFormatted: string;
  percent: number;
}

export interface Room {
  roomId: string;
  host: PublicUser | null;
  createdAt: number;
  usage: RoomUsage;
  isHost: boolean;
  members: RoomMember[];
  files: RoomFile[];
  password?: string;
  autoSync?: boolean;
}

export interface RoomWithPassword extends Room {
  password: string;
}
