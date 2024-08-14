import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import Chat from "../models/chat.model";
import { uploadMultipleFile } from "../../../helper/uploadFileToCloudinary";
import { Socket } from "socket.io";

interface SendMessageData {
    content: string;
    fileList: {
        originFileObj: Buffer;
    }[];
}

export const chat = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket: Socket) => {
        // console.log("1", socket.id);
        const currentUser: UserInterface = await checkUser(socket, key);
        if (currentUser) {
            socket.on("LOGOUT", () => {
                socket.disconnect(true);
            });

            socket.on("SEND_MESSAGE", async (data: SendMessageData) => {
                try {
                    // console.log(data);
                    const buffers = data.fileList.map(item => item.originFileObj);
                    const images = await uploadMultipleFile(buffers);
                    const content = data.content.trim();

                    if (content || images.length > 0) {
                        const chat = new Chat({
                            userId: currentUser._id,
                            content: content,
                            images: images
                        });
                        await chat.save();

                        const message = {
                            _id: chat.id,
                            userId: {
                                _id: currentUser._id,
                                avatar: currentUser.avatar
                            },
                            content: content,
                            images: images
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

            socket.on("TYPING", async (type) => {
                socket.broadcast.emit("SOCKET_BROADCAST_EMIT_TYPING", {
                    userId: {
                        _id: currentUser._id,
                        avatar: currentUser.avatar
                    },
                    type: type
                });
            });
        }
    });
};