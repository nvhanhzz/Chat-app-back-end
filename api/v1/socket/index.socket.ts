import { Server, Socket } from "socket.io";
import { authSocket } from "./auth.socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import http from 'http';
import { friendSocket } from "./friend.socket";
import chatSocket from "./chat.socket";

export let io: Server;

export interface UserSocketMap {
    [userId: string]: string[];
}

let users: UserSocketMap = {};

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', async (socket: Socket) => {
        const key = process.env.JWT_SIGNATURE as string;
        const currentUser: UserInterface = await checkUser(socket, key);
        if (!currentUser) {
            socket.disconnect();
            return;
        }

        const userId = currentUser._id;
        if (users[userId]) {
            users[userId].push(socket.id);
        } else {
            users[userId] = [socket.id];
        }
        // console.log(users);

        // Sử dụng các handler cho từng loại socket
        friendSocket(socket, currentUser, users);
        chatSocket(socket, currentUser);
        authSocket(socket);

        socket.on('disconnect', () => {
            // console.log('User disconnected:', socket.id);
            const socketIndex = users[userId].indexOf(socket.id);
            if (socketIndex !== -1) {
                users[userId].splice(socketIndex, 1);
            }
            if (users[userId].length === 0) {
                delete users[userId];
            }
            // console.log(users);
        });

    });

    return io;
};