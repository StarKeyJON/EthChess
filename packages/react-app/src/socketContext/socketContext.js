import socketio from "socket.io-client";
import { SOCKET_URL } from "../constants";
import React from "react";

export const socket = socketio.connect(SOCKET_URL);
export const SocketContext = React.createContext();
