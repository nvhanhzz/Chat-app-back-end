import { Socket } from "socket.io";

const authSocket = (socket: Socket) => {
    socket.on("LOGOUT", () => {
        socket.disconnect(true);
    });
};

export default authSocket;