import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";
export const socket = io(URL, {
  autoConnect: false,
});
