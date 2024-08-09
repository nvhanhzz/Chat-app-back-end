import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import Chat from "../models/chat.model";

export const chat = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket) => {
        console.log(socket.id);
        const currentUser: UserInterface = await checkUser(socket, key);
        if (currentUser) {
            socket.on("LOGOUT", () => {
                socket.disconnect(true);
            });

            socket.on("SEND_MESSAGE", async (data) => {
                try {
                    const content = data.content.trim();

                    if (content) {
                        const chat = new Chat({
                            userId: currentUser._id,
                            content: content
                        });
                        await chat.save();

                        const message = {
                            _id: chat.id,
                            userId: {
                                _id: currentUser._id,
                                avatar: currentUser.avatar
                            },
                            content: content
                        };

                        socket.emit("SOCKET_EMIT_MESSAGE", {
                            message: message
                        });

                        socket.broadcast.emit("SOCKET_BROADCAST_EMIT_MESSAGE", {
                            message: message
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    });
};