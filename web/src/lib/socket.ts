import { io, type Socket } from "socket.io-client";
import { API_URL, getStoredToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: getStoredToken(),
      },
    });
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
