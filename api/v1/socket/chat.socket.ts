import { UserInterface } from "../../../helper/userSocket";
import Chat, { IChat } from "../models/chat.model";
import { uploadMultipleFile } from "../../../helper/uploadFileToCloudinary";
import { Socket } from "socket.io";
import { io, UserSocketMap } from "./index.socket";
import RoomChat, { IRoomChat } from "../models/roomChat.model";

interface SendMessageData {
    roomChatId: string;
    content: string;
    fileList: {
        originFileObj: Buffer;
    }[];
}

interface Typing {
    roomChatId: string;
    type: 'show' | 'hide';
}

const getSocketsOfRoomChat = async (roomChatId: string, users: UserSocketMap): Promise<string[]> => {
    const room: IRoomChat | null = await RoomChat.findOne({
        _id: roomChatId,
        deleted: false
    });

    if (!room) {
        return null;
    }

    const members = room.members.map(member => member.toString());

    let sockets: string[] = [];
    for (const member of members) {
        const memberSockets = users[member];
        if (Array.isArray(memberSockets)) {
            sockets = [...sockets, ...memberSockets];
        }
    }

    return sockets;
}

const chatSocket = async (socket: Socket, currentUser: UserInterface, users: UserSocketMap) => {
    socket.on("SEND_MESSAGE", async (data: SendMessageData) => {
        try {
            const buffers = data.fileList.map(item => item.originFileObj);
            const images = await uploadMultipleFile(buffers);
            const content = data.content.trim();

            if (content || images.length > 0) {
                const chat: IChat = new Chat({
                    userId: currentUser._id,
                    content: content,
                    images: images,
                    roomChatId: data.roomChatId
                });
                await chat.save();

                const message = {
                    _id: chat.id,
                    userId: {
                        _id: currentUser._id,
                        avatar: currentUser.avatar
                    },
                    content: content,
                    images: images,
                    roomChatId: data.roomChatId
                };

                const sockets = await getSocketsOfRoomChat(data.roomChatId, users);
                if (Array.isArray(sockets) && sockets.length > 0) {
                    sockets.forEach((socketId) => {
                        io.to(socketId).emit("SERVER_EMIT_MESSAGE", {
                            message: message
                        });
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("TYPING", async (typing: Typing) => {
        const sockets = await getSocketsOfRoomChat(typing.roomChatId, users);
        if (Array.isArray(sockets) && sockets.length > 0) {
            sockets.forEach((socketId) => {
                io.to(socketId).emit("SERVER_EMIT_TYPING", {
                    userId: {
                        _id: currentUser._id,
                        avatar: currentUser.avatar
                    },
                    type: typing.type,
                    roomChatId: typing.roomChatId
                });
            });
        }
    });
}

export default chatSocket;