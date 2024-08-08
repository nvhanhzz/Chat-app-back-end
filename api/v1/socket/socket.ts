import { Server } from "socket.io";
import http from 'http';

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    return io;
};

export const getSocket = (): Server => {
    if (!io) {
        throw new Error("Socket.io server not initialized");
    }
    return io;
};