import { Server } from "socket.io";
import { config } from "./config.js";
import { db } from "./db.js";
import { sessionUserFromToken, publicUser } from "./auth.js";

const online = new Map(); // roomId -> Map<userId, profile>
let ioRef = null;

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookie = socket.handshake.headers.cookie || "";
    const match = new RegExp(`(?:^|;\\s*)${config.cookieName}=([^;]+)`).exec(
      cookie
    );
    const tokenFromCookie = match ? decodeURIComponent(match[1]) : null;
    const tokenFromAuth = socket.handshake.auth?.token;
    const tokenFromQuery = socket.handshake.query?.token;
    const token = tokenFromAuth || tokenFromQuery || tokenFromCookie;
    const user = await sessionUserFromToken(token);
    if (!user) return next(new Error("unauthorized"));
    socket.data.user = user;
    socket.data.rooms = new Set();
    next();
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    const profile = publicUser(user);

    socket.on("room:enter", async ({ roomId } = {}) => {
      if (typeof roomId !== "string") return;
      roomId = roomId.toLowerCase();
      const member = await db.get(
        "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?",
        [roomId, user.google_id]
      );
      if (!member) return;

      socket.data.rooms.add(roomId);
      socket.join(`room:${roomId}`);

      if (!online.has(roomId)) online.set(roomId, new Map());
      online.get(roomId).set(user.google_id, profile);

      socket.emit("members:list", [...online.get(roomId).values()]);
      socket.to(`room:${roomId}`).emit("member:joined", profile);
    });

    socket.on("disconnect", () => {
      for (const roomId of socket.data.rooms) {
        const members = online.get(roomId);
        if (members) {
          members.delete(user.google_id);
          if (members.size === 0) online.delete(roomId);
          socket.to(`room:${roomId}`).emit("member:left", user.google_id);
        }
      }
    });
  });

  ioRef = io;
  return io;
}

export function emitToRoom(roomId, event, payload) {
  const io = ioRef;
  if (io) io.to(`room:${roomId}`).emit(event, payload);
}

export function getOnlineUsers(roomId) {
  const members = online.get(roomId);
  return members ? [...members.values()] : [];
}
