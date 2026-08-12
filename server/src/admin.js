import { Router } from "express";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { db } from "./db.js";
import { encrypt, decrypt } from "./crypto.js";
import {
  disconnectUserSockets,
  emitToRoom,
  emitKickToUser,
  broadcastSystemMessage,
} from "./socket.js";

export const adminRouter = Router();

function createAdminToken() {
  return encrypt(`admin_session:${Date.now()}`);
}

function verifyAdminToken(token) {
  if (!token) return false;
  try {
    const decrypted = decrypt(token);
    if (!decrypted || !decrypted.startsWith("admin_session:")) return false;
    const timestamp = Number(decrypted.split(":")[1]);
    if (isNaN(timestamp)) return false;
    // Session valid for 30 days
    if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearerToken || req.cookies?.[config.admin.cookieName];
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  req.adminToken = token;
  next();
}

// ---- Admin Login ----
adminRouter.post("/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (email !== config.admin.email || password !== config.admin.password) {
    return res.status(401).json({ error: "Invalid admin email or password." });
  }

  const token = createAdminToken();
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(config.admin.cookieName, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: config.sessionTtlMs,
  });

  res.json({ ok: true, token });
});

// ---- Admin Status ----
adminRouter.get("/me", requireAdmin, (req, res) => {
  res.json({ ok: true, email: config.admin.email });
});

// ---- Admin Logout ----
adminRouter.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(config.admin.cookieName, {
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.json({ ok: true });
});

// ---- Get All Users & Rooms (Strict Privacy: NO file data) ----
adminRouter.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.all(
      `SELECT google_id, email, name, avatar, auth_type, created_at, banned
       FROM users
       ORDER BY created_at DESC`
    );

    const roomMemberships = await db.all(
      `SELECT rm.user_id, rm.room_id, rm.role, rm.joined_at, rm.left, rm.kicked, r.host_user_id
       FROM room_members rm
       JOIN rooms r ON r.room_id = rm.room_id
       ORDER BY rm.joined_at DESC`
    );

    const userMap = new Map();
    for (const u of users) {
      userMap.set(u.google_id, {
        id: u.google_id,
        email: u.email,
        name: u.name,
        avatar: u.avatar,
        authType: u.auth_type === "email" ? "email" : "google",
        createdAt: u.created_at,
        banned: !!u.banned,
        joinedRooms: [],
      });
    }

    for (const rm of roomMemberships) {
      const u = userMap.get(rm.user_id);
      if (u) {
        u.joinedRooms.push({
          roomId: rm.room_id,
          role: rm.role,
          joinedAt: rm.joined_at,
          left: !!rm.left,
          kicked: !!rm.kicked,
          isHost: rm.host_user_id === rm.user_id,
        });
      }
    }

    res.json({ users: Array.from(userMap.values()) });
  } catch (err) {
    console.error("[admin] error fetching users:", err?.message || err);
    res.status(500).json({ error: "Failed to fetch admin users data." });
  }
});

// ---- Ban User ----
adminRouter.post("/users/:userId/ban", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Invalid user ID." });

  try {
    await db.run("UPDATE users SET banned = 1 WHERE google_id = ?", [userId]);
    await db.run("DELETE FROM sessions WHERE user_id = ?", [userId]);
    disconnectUserSockets(userId, "Your account has been banned by an administrator.");

    res.json({ ok: true, userId, banned: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to ban user." });
  }
});

// ---- Unban User ----
adminRouter.post("/users/:userId/unban", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Invalid user ID." });

  try {
    await db.run("UPDATE users SET banned = 0 WHERE google_id = ?", [userId]);
    res.json({ ok: true, userId, banned: false });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to unban user." });
  }
});

// ---- Kick Member from Room ----
adminRouter.post("/users/:userId/rooms/:roomId/kick", requireAdmin, async (req, res) => {
  const { userId, roomId } = req.params;
  if (!userId || !roomId) return res.status(400).json({ error: "Invalid params." });

  const cleanRoomId = roomId.toLowerCase();
  try {
    await db.run(
      "UPDATE room_members SET kicked = 1, left = 1 WHERE room_id = ? AND user_id = ?",
      [cleanRoomId, userId]
    );
    emitToRoom(cleanRoomId, "member:kicked", { userId, roomId: cleanRoomId });
    emitKickToUser(userId, cleanRoomId, {
      kickerName: "Administrator",
      isHostKicker: false,
    });
    res.json({ ok: true, userId, roomId: cleanRoomId, kicked: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to kick member." });
  }
});

// ---- Unkick Member from Room ----
adminRouter.post("/users/:userId/rooms/:roomId/unkick", requireAdmin, async (req, res) => {
  const { userId, roomId } = req.params;
  if (!userId || !roomId) return res.status(400).json({ error: "Invalid params." });

  const cleanRoomId = roomId.toLowerCase();
  try {
    await db.run(
      "UPDATE room_members SET kicked = 0 WHERE room_id = ? AND user_id = ?",
      [cleanRoomId, userId]
    );
    res.json({ ok: true, userId, roomId: cleanRoomId, kicked: false });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to unkick member." });
  }
});

// ---- OP ADMIN TOOL: Global Real-Time System Broadcast ----
adminRouter.post("/broadcast", requireAdmin, (req, res) => {
  const message = String(req.body?.message || "").trim();
  const level = String(req.body?.level || "info");
  if (!message) return res.status(400).json({ error: "Message content is required." });

  broadcastSystemMessage(message, level);
  res.json({ ok: true, message, level });
});

// ---- OP ADMIN TOOL: Get All Rooms (Host Info & Usage — NO file details) ----
adminRouter.get("/rooms", requireAdmin, async (req, res) => {
  try {
    const rooms = await db.all(
      `SELECT r.room_id, r.created_at, r.total_bytes, r.host_user_id,
              u.name AS host_name, u.email AS host_email, u.avatar AS host_avatar,
              (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.room_id AND (rm.left IS NULL OR rm.left = 0)) AS member_count
       FROM rooms r
       JOIN users u ON u.google_id = r.host_user_id
       ORDER BY r.created_at DESC`
    );

    res.json({
      rooms: rooms.map((r) => ({
        roomId: r.room_id,
        createdAt: r.created_at,
        totalBytes: r.total_bytes,
        host: {
          id: r.host_user_id,
          name: r.host_name,
          email: r.host_email,
          avatar: r.host_avatar,
        },
        memberCount: r.member_count,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch rooms." });
  }
});

// ---- OP ADMIN TOOL: Delete Room (Evacuates members & cleans DB) ----
adminRouter.delete("/rooms/:roomId", requireAdmin, async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) return res.status(400).json({ error: "Invalid room ID." });

  const cleanRoomId = roomId.toLowerCase();
  try {
    emitToRoom(cleanRoomId, "room:deleted", { roomId: cleanRoomId });
    await db.run("DELETE FROM files WHERE room_id = ?", [cleanRoomId]);
    await db.run("DELETE FROM room_members WHERE room_id = ?", [cleanRoomId]);
    await db.run("DELETE FROM rooms WHERE room_id = ?", [cleanRoomId]);

    res.json({ ok: true, roomId: cleanRoomId, deleted: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to delete room." });
  }
});

// ---- OP ADMIN TOOL: User Password Reset ----
adminRouter.post("/users/:userId/reset-password", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const newPassword = String(req.body?.password || "").trim();
  if (!userId) return res.status(400).json({ error: "Invalid user ID." });
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE google_id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found." });

    const hash = bcrypt.hashSync(newPassword, 10);
    await db.run("UPDATE users SET password_hash = ? WHERE google_id = ?", [hash, userId]);
    await db.run("DELETE FROM sessions WHERE user_id = ?", [userId]);
    disconnectUserSockets(userId, "Your password was reset by an administrator.");

    res.json({ ok: true, userId, message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to reset password." });
  }
});

// ---- OP ADMIN TOOL: Emergency Purge All Active Sessions ----
adminRouter.post("/sessions/purge", requireAdmin, async (req, res) => {
  try {
    await db.run("DELETE FROM sessions");
    res.json({ ok: true, message: "All user sessions invalidated." });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to purge sessions." });
  }
});
