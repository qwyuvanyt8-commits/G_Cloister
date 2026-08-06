import { io, type Socket } from "socket.io-client";
import { API_URL, getStoredToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = getStoredToken();
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
