import { io } from "socket.io-client";

const SOCKET_URL = "https://social-app-backend-b6dw.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
