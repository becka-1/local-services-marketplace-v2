import { io } from 'socket.io-client';

let socket = null;

const rawBase = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "")
  .replace(/\/api$/, "")
  .replace(/\/+$/, "");
const SOCKET_URL = rawBase || `http://${window.location.hostname}:5000`;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
