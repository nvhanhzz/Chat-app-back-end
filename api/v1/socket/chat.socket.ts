import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";

export const chat = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket) => {
        console.log(socket.id);
        const currentUser: UserInterface = await checkUser(socket, key);
        if (currentUser) {
            socket.on("SEND_MESSAGE", (data) => {
                console.log(socket.id, currentUser._id, data);
            });
            socket.on("LOGOUT", () => {
                socket.disconnect(true);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        }
    });
};