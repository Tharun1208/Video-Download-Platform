import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://video-download-platform.onrender.com";
const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  withCredentials: true,
  timeout: 20000,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;