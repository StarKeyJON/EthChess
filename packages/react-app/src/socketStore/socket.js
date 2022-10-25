import io from "socket.io-client";

export let socketId = "";

export const socket = io("http://localhost:8080");
socket.on("connect", () => {
  socketId = socket.id;
});
