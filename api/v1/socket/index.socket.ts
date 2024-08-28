import { Server, Socket } from "socket.io";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import http from 'http';
import authSocket from "./auth.socket";
import friendSocket from "./friend.socket";
import chatSocket from "./chat.socket";
import User from "../models/user.model";
import onlineSocket from "./online.socket";

export let io: Server;

export interface UserSocketMap {
    [userId: string]: string[];
}

export let users: UserSocketMap = {};

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
            try {
                await User.updateOne(
                    {
                        _id: userId
                    },
                    {
                        isOnline: true
                    }
                );
            } catch (error) {
                console.error(`Failed to update user ${userId} on connect:`, error);
            }
            onlineSocket(currentUser, users, { isOnline: true, lastOnline: new Date(Date.now()) });
        }

        friendSocket(socket, currentUser, users);
        chatSocket(socket, currentUser, users);
        authSocket(socket);

        socket.on('disconnect', async () => {
            const socketIndex = users[userId].indexOf(socket.id);
            if (socketIndex !== -1) {
                users[userId].splice(socketIndex, 1);
            }
            if (users[userId].length === 0) {
                delete users[userId];
                try {
                    await User.updateOne(
                        {
                            _id: userId
                        },
                        {
                            isOnline: false,
                            lastOnline: Date.now()
                        }
                    );
                } catch (error) {
                    console.error(`Failed to update user ${userId} on disconnect:`, error);
                }
                onlineSocket(currentUser, users, { isOnline: false, lastOnline: new Date(Date.now()) });
            }
        });

    });

    return io;
};