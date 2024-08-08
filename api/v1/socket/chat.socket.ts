import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";

export const chat = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket) => {
        const currentUser: UserInterface = await checkUser(socket, key);

        socket.on("SEND_MESSAGE", (data) => {
            console.log(socket.id, currentUser._id, data);
        });
    });
};