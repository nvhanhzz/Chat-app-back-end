import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import { Socket } from "socket.io";

const authSocket = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket: Socket) => {
        const currentUser: UserInterface = await checkUser(socket, key);
        if (!currentUser) {
            socket.disconnect();
            return;
        }

        socket.on("LOGOUT", () => {
            socket.disconnect(true);
        });
    });
};

export default authSocket;