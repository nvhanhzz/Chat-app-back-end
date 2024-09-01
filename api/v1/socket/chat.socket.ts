import { UserInterface } from "../../../helper/userSocket";
import Chat, { IChat } from "../models/chat.model";
import { uploadMultipleFile, uploadSingleFile } from "../../../helper/uploadFileToCloudinary";
import { Socket } from "socket.io";
import { io, UserSocketMap } from "./index.socket";
import RoomChat, { IRoomChat } from "../models/roomChat.model";
import RoomType from "../../../enums/roomType.enums";

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

interface GroupData {
    groupName: string;
    avatar: Buffer | string | null;
    members: string[];
};

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

    socket.on("CREAT_GROUP_CHAT", async (data: GroupData) => {
        try {
            data.members.push(currentUser._id);
            if (data.avatar) {
                data.avatar = await uploadSingleFile(data.avatar as Buffer);
            }

            if (data.members.length < 3) {
                return;
            }

            const roomChat = new RoomChat({
                title: data.groupName,
                avatar: data.avatar,
                members: data.members,
                type: RoomType.Group
            });

            const savedRoomChat = await roomChat.save();

            if (savedRoomChat) {
                const populatedRoomChat = await savedRoomChat.populate('members', 'fullName avatar');

                for (const member of populatedRoomChat.members) {
                    const sockets = users[member._id.toString()];
                    if (Array.isArray(sockets) && sockets.length > 0) {
                        sockets.forEach((socketId) => {
                            io.to(socketId).emit("SERVER_EMIT_CREATE_NEW_GROUP", {
                                group: populatedRoomChat
                            });
                        });
                    }
                }
            } else {
                console.log('Không thể lưu room chat.');
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi khi lưu room chat:', error);
        }
    });
}

export default chatSocket;