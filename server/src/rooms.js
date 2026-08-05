import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { db } from "./db.js";
import { requireAuth, publicUser } from "./auth.js";
import * as drive from "./drive.js";
import { emitToRoom, getOnlineUsers } from "./socket.js";

const GB = 1024 * 1024 * 1024;

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generatePassword(length = 8) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

function sanitizeRoomId(input) {
  if (typeof input !== "string") return null;
  const id = input.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-_]{2,19}$/.test(id)) return null;
  const reserved = ["api", "auth", "host", "join", "home", "login", "logout"];
  if (reserved.includes(id)) return null;
  return id;
}

function sanitizeFileName(input) {
  if (typeof input !== "string") return null;
  let name = input.replace(/[\\/]/g, "_").replace(/[\x00-\x1f]/g, "").trim();
  if (!name) return null;
  if (name.length > 255) name = name.slice(0, 255);
  return name;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n;
  let i = -1;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}

function isMember(userId, roomId) {
  return !!db
    .prepare("SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?")
    .get(roomId, userId);
}

function getRoomOrNull(roomId) {
  return db.prepare("SELECT * FROM rooms WHERE room_id = ?").get(roomId) || null;
}

function getFileRow(fileId, roomId) {
  return (
    db
      .prepare("SELECT * FROM files WHERE id = ? AND room_id = ?")
      .get(fileId, roomId) || null
  );
}

function roomSummary(room) {
  const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
  return {
    roomId: room.room_id,
    host: publicUser(host),
    createdAt: room.created_at,
    usage: {
      usedBytes: room.total_bytes,
      limitBytes: config.roomStorageBytes,
      usedFormatted: formatBytes(room.total_bytes),
      limitFormatted: formatBytes(config.roomStorageBytes),
      percent: Math.min(100, (room.total_bytes / config.roomStorageBytes) * 100),
    },
  };
}

function buildRoomView(room, viewerId) {
  const members = db
    .prepare(
      `SELECT rm.role, u.google_id, u.email, u.name, u.avatar
       FROM room_members rm JOIN users u ON u.google_id = rm.user_id
       WHERE rm.room_id = ? ORDER BY rm.joined_at ASC`
    )
    .all(room.room_id);

  const online = new Set(getOnlineUsers(room.room_id).map((u) => u.id));

  const files = db
    .prepare(
      `SELECT f.*, u.google_id AS up_id, u.name AS up_name, u.avatar AS up_avatar
       FROM files f JOIN users u ON u.google_id = f.uploader_id
       WHERE f.room_id = ? ORDER BY f.created_at DESC`
    )
    .all(room.room_id)
    .map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mime_type,
      sizeBytes: f.size_bytes,
      sizeFormatted: formatBytes(f.size_bytes),
      createdAt: f.created_at,
      uploader: { id: f.up_id, name: f.up_name, avatar: f.up_avatar },
    }));

  return {
    ...roomSummary(room),
    isHost: room.host_user_id === viewerId,
    members: members.map((m) => ({
      id: m.google_id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role,
      online: online.has(m.google_id),
    })),
    files,
  };
}

export const roomsRouter = Router();

// ---- Create (host) ----
roomsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const roomId = sanitizeRoomId(req.body?.roomId);
    if (!roomId) {
      return res.status(400).json({
        error:
          "Room ID must be 3–20 characters using letters, numbers, '-' or '_'.",
      });
    }
    if (getRoomOrNull(roomId)) {
      return res.status(409).json({ error: "That room ID is already taken." });
    }
    if (!req.user.refresh_token && !req.user.access_token) {
      return res.status(403).json({
        error: "You need Google Drive access to host a room. Please sign in again.",
        code: "DRIVE_NO_TOKEN",
      });
    }

    const folderId = await drive.ensureRoomFolder(req.user, roomId);
    const password = generatePassword();
    const hash = bcrypt.hashSync(password, 10);
    const now = Date.now();

    db.prepare(
      `INSERT INTO rooms (room_id, host_user_id, password_hash, folder_id, total_bytes, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`
    ).run(roomId, req.user.google_id, hash, folderId, now);
    db.prepare(
      `INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?, ?, 'host', ?)`
    ).run(roomId, req.user.google_id, now);

    const room = getRoomOrNull(roomId);
    res.status(201).json({
      ...roomSummary(room),
      isHost: true,
      password,
    });
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Join ----
roomsRouter.post("/join", requireAuth, async (req, res) => {
  try {
    const roomId = sanitizeRoomId(req.body?.roomId);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!roomId) {
      return res.status(400).json({ error: "Enter a valid room ID." });
    }
    const room = getRoomOrNull(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found. Check the room ID." });
    }
    if (!bcrypt.compareSync(password, room.password_hash)) {
      return res.status(401).json({ error: "Incorrect room password." });
    }
    db.prepare(
      `INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)
       ON CONFLICT(room_id, user_id) DO NOTHING`
    ).run(roomId, req.user.google_id, Date.now());

    emitToRoom(roomId, "member:joined", publicUser(req.user));
    res.json(buildRoomView(room, req.user.google_id));
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Room detail ----
roomsRouter.get("/:roomId", requireAuth, (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "You are not a member of this room." });
  }
  res.json(buildRoomView(room, req.user.google_id));
});

// ---- Upload ----
roomsRouter.post("/:roomId/files", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "Not a room member." });
  }

  const rawName = req.headers["x-file-name"];
  let name = null;
  try {
    name = sanitizeFileName(decodeURIComponent(rawName || ""));
  } catch {
    name = sanitizeFileName(rawName);
  }
  const mimeType = req.headers["content-type"] || "application/octet-stream";
  const sizeRaw = req.headers["content-length"];
  const size = sizeRaw ? Number(sizeRaw) : NaN;

  if (!name) return res.status(400).json({ error: "Missing or invalid file name." });
  if (!Number.isFinite(size) || size <= 0) {
    return res.status(400).json({ error: "Missing or invalid file size." });
  }
  if (size > config.maxFileBytes) {
    return res
      .status(413)
      .json({ error: `File exceeds the ${formatBytes(config.maxFileBytes)} single-file limit.` });
  }
  const remaining = config.roomStorageBytes - room.total_bytes;
  if (size > remaining) {
    return res
      .status(507)
      .json({
        error: `Not enough space. Only ${formatBytes(Math.max(0, remaining))} left in this room.`,
      });
  }

  try {
    const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
    const token = await drive.getAccessToken(host);
    const folderId = await drive.ensureRoomFolder(host, roomId);
    const uploadUri = await drive.createResumableSession(token, folderId, name, mimeType);

    let driveFile;
    try {
      driveFile = await drive.uploadStream(token, uploadUri, req, size);
    } catch (streamErr) {
      return handleDriveError(res, streamErr);
    }

    const now = Date.now();
    const fileId = crypto.randomUUID();
    db.prepare(
      `INSERT INTO files (id, room_id, drive_file_id, name, mime_type, size_bytes, uploader_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      fileId,
      roomId,
      driveFile.id,
      name,
      mimeType,
      size,
      req.user.google_id,
      now
    );

    db.prepare("UPDATE rooms SET total_bytes = total_bytes + ? WHERE room_id = ?").run(
      size,
      roomId
    );

    const file = {
      id: fileId,
      name,
      mimeType,
      sizeBytes: size,
      sizeFormatted: formatBytes(size),
      createdAt: now,
      uploader: {
        id: req.user.google_id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    };

    emitToRoom(roomId, "file:added", file);
    emitToRoom(roomId, "usage:updated", { usedBytes: room.total_bytes + size });
    res.status(201).json(file);
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Download ----
roomsRouter.get("/:roomId/files/:fileId/download", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const file = getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "Not a room member." });
  }
  try {
    const room = getRoomOrNull(roomId);
    const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
    const token = await drive.getAccessToken(host);
    const dl = await drive.downloadDriveStream(token, file.drive_file_id);
    const safeName = file.name.replace(/"/g, "");
    res.setHeader("Content-Type", dl.contentType || file.mime_type || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    if (dl.contentLength) res.setHeader("Content-Length", dl.contentLength);
    dl.stream.on("error", () => res.destroy());
    dl.stream.pipe(res);
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Preview (temp link) ----
const linkCache = new Map(); // fileId -> {permissionId, expiresAt, links}

roomsRouter.get("/:roomId/files/:fileId/preview", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const file = getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "Not a room member." });
  }

  try {
    const room = getRoomOrNull(roomId);
    const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
    const token = await drive.getAccessToken(host);

    const cached = linkCache.get(file.drive_file_id);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ ...cached.links, mimeType: file.mime_type, name: file.name, cached: true });
    }
    if (cached) {
      await drive.revokeViewPermission(file.drive_file_id, cached.permissionId, token).catch(() => {});
      linkCache.delete(file.drive_file_id);
    }

    const { permissionId, webViewLink, webContentLink, thumbnailLink } =
      await drive.ensureViewPermission(file.drive_file_id, token);
    const embedLink = webViewLink ? webViewLink.replace(/\/view(\?.*)?$/, "/preview") : webViewLink;
    const links = { viewLink: embedLink, contentLink: webContentLink, thumbnailLink };
    const expiresAt = Date.now() + config.previewLinkTtlMs;
    linkCache.set(file.drive_file_id, { permissionId, expiresAt, links });
    setTimeout(() => {
      drive.revokeViewPermission(file.drive_file_id, permissionId, token).catch(() => {});
      linkCache.delete(file.drive_file_id);
    }, config.previewLinkTtlMs);

    res.json({ ...links, mimeType: file.mime_type, name: file.name, cached: false });
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Rename ----
roomsRouter.post("/:roomId/files/:fileId/rename", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const file = getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "Not a room member." });
  }
  const newName = sanitizeFileName(req.body?.name);
  if (!newName) return res.status(400).json({ error: "Invalid file name." });
  try {
    const room = getRoomOrNull(roomId);
    const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
    const token = await drive.getAccessToken(host);
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.drive_file_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    }).then((r) => {
      if (!r.ok) throw new Error(`Drive rename ${r.status}`);
    });
    db.prepare("UPDATE files SET name = ? WHERE id = ?").run(newName, file.id);
    emitToRoom(roomId, "file:updated", { id: file.id, name: newName });
    res.json({ id: file.id, name: newName });
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Delete ----
roomsRouter.delete("/:roomId/files/:fileId", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const file = getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!isMember(req.user.google_id, roomId)) {
    return res.status(403).json({ error: "Not a room member." });
  }
  const room = getRoomOrNull(roomId);
  const canDelete = room.host_user_id === req.user.google_id || file.uploader_id === req.user.google_id;
  if (!canDelete) {
    return res.status(403).json({ error: "Only the host or the uploader can delete this file." });
  }
  try {
    const host = db.prepare("SELECT * FROM users WHERE google_id = ?").get(room.host_user_id);
    const token = await drive.getAccessToken(host);
    await drive.deleteDriveFile(token, file.drive_file_id);
    db.prepare("DELETE FROM files WHERE id = ?").run(file.id);
    db.prepare("UPDATE rooms SET total_bytes = MAX(0, total_bytes - ?) WHERE room_id = ?").run(
      file.size_bytes,
      roomId
    );
    emitToRoom(roomId, "file:deleted", { id: file.id });
    emitToRoom(roomId, "usage:updated", { usedBytes: room.total_bytes - file.size_bytes });
    res.json({ id: file.id, deleted: true });
  } catch (err) {
    handleDriveError(res, err);
  }
});

function handleDriveError(res, err) {
  console.error("[rooms] drive error:", err?.message || err);
  if (err?.code === "DRIVE_NO_TOKEN") {
    return res.status(403).json({ error: err.message, code: err.code });
  }
  if (err?.status) {
    const status = Number(err.status);
    if (status === 401 || status === 403) {
      return res.status(403).json({
        error:
          "The host's Google Drive access expired. Ask the host to sign in again.",
        code: "DRIVE_AUTH",
      });
    }
    if (status >= 500) {
      return res.status(502).json({ error: "Google Drive is having issues. Try again." });
    }
    return res.status(status).json({ error: err.message });
  }
  res.status(500).json({ error: "Something went wrong. Try again." });
}
