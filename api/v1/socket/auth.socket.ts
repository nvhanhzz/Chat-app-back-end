import { Socket } from "socket.io";

export const authSocket = (socket: Socket) => {
    socket.on("LOGOUT", () => {
        socket.disconnect(true);
    });
};