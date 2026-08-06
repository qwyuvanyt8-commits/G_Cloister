import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { db } from "./db.js";
import { requireAuth, publicUser } from "./auth.js";
import { encrypt, decrypt } from "./crypto.js";
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

async function isMember(userId, roomId) {
  return !!(await db.get(
    "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ? AND (left IS NULL OR left = 0)",
    [roomId, userId]
  ));
}

async function getRoomOrNull(roomId) {
  return (await db.get("SELECT * FROM rooms WHERE room_id = ?", [roomId])) || null;
}

async function getFileRow(fileId, roomId) {
  return (
    (await db.get("SELECT * FROM files WHERE id = ? AND room_id = ?", [fileId, roomId])) ||
    null
  );
}

async function roomSummary(room) {
  const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
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

async function buildRoomView(room, viewerId) {
  const members = await db.all(
    `SELECT rm.role, rm.left, u.google_id, u.email, u.name, u.avatar
     FROM room_members rm JOIN users u ON u.google_id = rm.user_id
     WHERE rm.room_id = ? ORDER BY rm.joined_at ASC`,
    [room.room_id]
  );

  const online = new Set(getOnlineUsers(room.room_id).map((u) => u.id));
  if (viewerId) online.add(viewerId);

  const files = (
    await db.all(
      `SELECT f.*, u.google_id AS up_id, u.name AS up_name, u.avatar AS up_avatar
       FROM files f JOIN users u ON u.google_id = f.uploader_id
       WHERE f.room_id = ? ORDER BY f.created_at DESC`,
      [room.room_id]
    )
  ).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mime_type,
    sizeBytes: f.size_bytes,
    sizeFormatted: formatBytes(f.size_bytes),
    createdAt: f.created_at,
    uploader: { id: f.up_id, name: f.up_name, avatar: f.up_avatar },
  }));

  const summary = await roomSummary(room);

  const result = {
    ...summary,
    isHost: room.host_user_id === viewerId,
    members: members.map((m) => ({
      id: m.google_id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role,
      online: online.has(m.google_id),
      left: !!m.left,
    })),
    files,
  };

  const memberRow = await db.get(
    "SELECT auto_sync FROM room_members WHERE room_id = ? AND user_id = ?",
    [room.room_id, viewerId]
  );
  result.autoSync = memberRow ? !!memberRow.auto_sync : false;

  // If the viewer is the host, include the room password so they can share invite links
  if (room.host_user_id === viewerId && room.password_encrypted) {
    try {
      result.password = decrypt(room.password_encrypted);
    } catch { /* ignore decryption errors */ }
  }

  return result;
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
    if (await getRoomOrNull(roomId)) {
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
    const encryptedPw = encrypt(password);
    const now = Date.now();

    await db.run(
      `INSERT INTO rooms (room_id, host_user_id, password_hash, password_encrypted, folder_id, total_bytes, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [roomId, req.user.google_id, hash, encryptedPw, folderId, now]
    );
    await db.run(
      `INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?, ?, 'host', ?)`,
      [roomId, req.user.google_id, now]
    );

    const room = await getRoomOrNull(roomId);
    const summary = await roomSummary(room);
    res.status(201).json({
      ...summary,
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
    const room = await getRoomOrNull(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found. Check the room ID." });
    }
    if (!bcrypt.compareSync(password, room.password_hash)) {
      return res.status(401).json({ error: "Incorrect room password." });
    }
    const existingMember = await db.get(
      "SELECT kicked FROM room_members WHERE room_id = ? AND user_id = ?",
      [roomId, req.user.google_id]
    );
    if (existingMember?.kicked === 1) {
      return res.status(403).json({ error: "You have been kicked from this room by the host." });
    }
    await db.run(
      `INSERT INTO room_members (room_id, user_id, role, joined_at, left) VALUES (?, ?, 'member', ?, 0)
       ON CONFLICT(room_id, user_id) DO UPDATE SET left = 0, joined_at = ?`,
      [roomId, req.user.google_id, Date.now(), Date.now()]
    );

    emitToRoom(roomId, "member:joined", publicUser(req.user));
    res.json(await buildRoomView(room, req.user.google_id));
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- My rooms (hosted + joined) ----
roomsRouter.get("/my", requireAuth, async (req, res) => {
  const userId = req.user.google_id;

  const hosted = await db.all(
    `SELECT r.room_id, r.created_at, r.total_bytes,
            (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.room_id AND (rm2.left IS NULL OR rm2.left = 0)) AS member_count,
            EXISTS(SELECT 1 FROM room_members rm3 WHERE rm3.room_id = r.room_id AND rm3.user_id = ? AND (rm3.left IS NULL OR rm3.left = 0)) AS is_member
     FROM rooms r
     WHERE r.host_user_id = ?
     ORDER BY r.created_at DESC`,
    [userId, userId]
  );

  const joined = await db.all(
    `SELECT r.room_id, r.created_at, r.total_bytes,
            u.name AS host_name, u.avatar AS host_avatar,
            (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.room_id AND (rm2.left IS NULL OR rm2.left = 0)) AS member_count,
            (rm.left IS NULL OR rm.left = 0) AS is_member
     FROM rooms r
     JOIN room_members rm ON rm.room_id = r.room_id AND rm.user_id = ?
     JOIN users u ON u.google_id = r.host_user_id
     WHERE r.host_user_id != ?
     ORDER BY rm.joined_at DESC`,
    [userId, userId]
  );

  res.json({
    hosted: hosted.map((r) => ({
      roomId: r.room_id,
      createdAt: r.created_at,
      usedBytes: r.total_bytes,
      usedFormatted: formatBytes(r.total_bytes),
      limitFormatted: formatBytes(config.roomStorageBytes),
      memberCount: r.member_count,
      isMember: !!r.is_member,
    })),
    joined: joined.map((r) => ({
      roomId: r.room_id,
      createdAt: r.created_at,
      usedBytes: r.total_bytes,
      usedFormatted: formatBytes(r.total_bytes),
      limitFormatted: formatBytes(config.roomStorageBytes),
      hostName: r.host_name,
      hostAvatar: r.host_avatar,
      memberCount: r.member_count,
      isMember: !!r.is_member,
    })),
  });
});

// ---- Room detail ----
roomsRouter.get("/:roomId", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });

  const memberRow = await db.get(
    "SELECT role, left, kicked FROM room_members WHERE room_id = ? AND user_id = ?",
    [roomId, req.user.google_id]
  );

  if (memberRow) {
    if (memberRow.kicked === 1) {
      return res.status(403).json({ error: "You have been kicked from this room by the host." });
    }
    if (memberRow.left === 1) {
      await db.run(
        "UPDATE room_members SET left = 0, joined_at = ? WHERE room_id = ? AND user_id = ?",
        [Date.now(), roomId, req.user.google_id]
      );
      emitToRoom(roomId, "member:joined", publicUser(req.user));
    }
  } else if (room.host_user_id === req.user.google_id) {
    await db.run(
      `INSERT INTO room_members (room_id, user_id, role, joined_at, left, kicked) VALUES (?, ?, 'host', ?, 0, 0)
       ON CONFLICT(room_id, user_id) DO UPDATE SET left = 0`,
      [roomId, req.user.google_id, Date.now()]
    );
  } else {
    return res.status(403).json({ error: "You are not a member of this room." });
  }

  res.json(await buildRoomView(room, req.user.google_id));
});

// ---- Leave room ----
roomsRouter.post("/:roomId/leave", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "You are not an active member of this room." });
  }
  await db.run(
    "UPDATE room_members SET left = 1 WHERE room_id = ? AND user_id = ?",
    [roomId, req.user.google_id]
  );
  emitToRoom(roomId, "member:left", req.user.google_id);
  res.json({ ok: true });
});

// ---- Kick member (host only) ----
roomsRouter.post("/:roomId/kick", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const targetUserId = typeof req.body?.targetUserId === "string" ? req.body.targetUserId : "";
  if (!roomId || !targetUserId) {
    return res.status(400).json({ error: "Room ID and target user ID are required." });
  }
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (room.host_user_id !== req.user.google_id) {
    return res.status(403).json({ error: "Only the room host can kick members." });
  }
  if (targetUserId === req.user.google_id) {
    return res.status(400).json({ error: "Host cannot kick themselves." });
  }

  await db.run(
    "UPDATE room_members SET kicked = 1, left = 1 WHERE room_id = ? AND user_id = ?",
    [roomId, targetUserId]
  );

  const targetUser = await db.get("SELECT * FROM users WHERE google_id = ?", [targetUserId]);
  if (targetUser) {
    drive.deleteUserRoomFolder(targetUser, roomId).catch((err) =>
      console.error("[kick] drive purge error:", err.message)
    );
  }

  emitToRoom(roomId, "member:kicked", { userId: targetUserId, roomId });
  res.json({ ok: true, targetUserId });
});

// ---- Unkick member (host only) ----
roomsRouter.post("/:roomId/unkick", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const targetUserId = typeof req.body?.targetUserId === "string" ? req.body.targetUserId : "";
  if (!roomId || !targetUserId) {
    return res.status(400).json({ error: "Room ID and target user ID are required." });
  }
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (room.host_user_id !== req.user.google_id) {
    return res.status(403).json({ error: "Only the room host can unkick members." });
  }

  await db.run(
    "UPDATE room_members SET kicked = 0 WHERE room_id = ? AND user_id = ?",
    [roomId, targetUserId]
  );

  emitToRoom(roomId, "member:unkicked", { userId: targetUserId, roomId });
  res.json({ ok: true, targetUserId });
});

// ---- Delete entire room (host only) ----
roomsRouter.delete("/:roomId", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (room.host_user_id !== req.user.google_id) {
    return res.status(403).json({ error: "Only the host can delete this room." });
  }

  await db.run("DELETE FROM rooms WHERE room_id = ?", [roomId]);
  await db.run("DELETE FROM room_members WHERE room_id = ?", [roomId]);
  await db.run("DELETE FROM files WHERE room_id = ?", [roomId]);

  emitToRoom(roomId, "room:deleted", { roomId });
  res.json({ ok: true, roomId });
});

// ---- Forget room (participant removes room card from list) ----
roomsRouter.delete("/:roomId/forget", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  await db.run(
    "DELETE FROM room_members WHERE room_id = ? AND user_id = ?",
    [roomId, req.user.google_id]
  );
  res.json({ ok: true, roomId });
});

// ---- Auto-sync toggle ----
roomsRouter.post("/:roomId/sync", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "You are not a member of this room." });
  }
  if (room.host_user_id === req.user.google_id) {
    return res.status(400).json({ error: "As host, files are already in your Google Drive." });
  }
  try {
    const syncedCount = await drive.syncRoomFilesToParticipant(roomId, req.user);
    res.json({ ok: true, syncedCount });
  } catch (err) {
    handleDriveError(res, err);
  }
});
// ---- Upload ----
roomsRouter.post("/:roomId/files", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });
  const room = await getRoomOrNull(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
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
    const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
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
    await db.run(
      `INSERT INTO files (id, room_id, drive_file_id, name, mime_type, size_bytes, uploader_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileId, roomId, driveFile.id, name, mimeType, size, req.user.google_id, now]
    );

    await db.run("UPDATE rooms SET total_bytes = total_bytes + ? WHERE room_id = ?", [
      size,
      roomId,
    ]);

    // Background sync to all room members who enabled auto_sync
    (async () => {
      try {
        const autoSyncMembers = await db.all(
          `SELECT u.* FROM room_members rm
           JOIN users u ON u.google_id = rm.user_id
           WHERE rm.room_id = ? AND rm.auto_sync = 1`,
          [roomId]
        );
        for (const member of autoSyncMembers) {
          await drive.syncFileToUserDrive(
            host,
            member,
            roomId,
            driveFile.id,
            name,
            mimeType,
            size
          );
        }
      } catch (e) {
        console.error("[sync] Background sync error:", e?.message || e);
      }
    })();

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
  const file = await getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "Not a room member." });
  }
  try {
    const room = await getRoomOrNull(roomId);
    const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
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
  const file = await getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "Not a room member." });
  }

  try {
    const room = await getRoomOrNull(roomId);
    const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
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
  const file = await getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "Not a room member." });
  }
  const newName = sanitizeFileName(req.body?.name);
  if (!newName) return res.status(400).json({ error: "Invalid file name." });
  try {
    const room = await getRoomOrNull(roomId);
    const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
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
    await db.run("UPDATE files SET name = ? WHERE id = ?", [newName, file.id]);
    emitToRoom(roomId, "file:updated", { id: file.id, name: newName });
    res.json({ id: file.id, name: newName });
  } catch (err) {
    handleDriveError(res, err);
  }
});

// ---- Delete ----
roomsRouter.delete("/:roomId/files/:fileId", requireAuth, async (req, res) => {
  const roomId = sanitizeRoomId(req.params.roomId);
  const file = await getFileRow(req.params.fileId, roomId);
  if (!file) return res.status(404).json({ error: "File not found." });
  if (!(await isMember(req.user.google_id, roomId))) {
    return res.status(403).json({ error: "Not a room member." });
  }
  const room = await getRoomOrNull(roomId);
  const canDelete = room.host_user_id === req.user.google_id || file.uploader_id === req.user.google_id;
  if (!canDelete) {
    return res.status(403).json({ error: "Only the host or the uploader can delete this file." });
  }
  try {
    const host = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
    const token = await drive.getAccessToken(host);
    await drive.deleteDriveFile(token, file.drive_file_id);
    drive.deleteSyncedFileFromAllMembers(roomId, file.name).catch((e) =>
      console.error("[delete] deleteSyncedFileFromAllMembers error:", e?.message || e)
    );
    await db.run("DELETE FROM files WHERE id = ?", [file.id]);
    await db.run(
      "UPDATE rooms SET total_bytes = MAX(0, total_bytes - ?) WHERE room_id = ?",
      [file.size_bytes, roomId]
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
