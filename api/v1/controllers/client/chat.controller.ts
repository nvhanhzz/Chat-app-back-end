import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import { UserInterface } from "../../../../helper/userSocket";
import RoomChat, { IRoomChat } from "../../models/roomChat.model";
import RoomType from "../../../../enums/roomType.enums";
import User, { IUser } from "../../models/user.model";

// [GET] /api/v1/chat/rooms
export const getRoomsChatForUser = async (req: Request & { currentUser?: UserInterface }, res: Response): Promise<Response> => {
    try {
        const userId = req.currentUser._id;

        const rooms: IRoomChat[] = await RoomChat
            .find({ members: userId })
            .populate("members", "fullName avatar");

        const roomIds = rooms.map(room => room._id);

        const lastMessages = await Chat.aggregate([
            {
                $match: { roomChatId: { $in: roomIds } }, // Lọc các tin nhắn theo roomChatId
            },
            {
                $sort: { createdAt: -1 }, // Sắp xếp tin nhắn theo createdAt giảm dần (mới nhất trước)
            },
            {
                $group: {
                    _id: '$roomChatId', // Nhóm theo roomChatId
                    lastMessage: { $first: '$$ROOT' }, // Lấy tin nhắn đầu tiên sau khi sắp xếp (mới nhất)
                },
            }
        ]);

        const result = await Promise.all(rooms.map(async (room) => {
            const lastMessage = lastMessages.find(msg => String(msg._id) === String(room._id));

            let avatar = room.avatar;
            let title = room.title;
            let isOnline = false;
            let lastOnline: Date = new Date(Date.now());
            if (room.type === RoomType.OneToOne) {
                const otherMember = room.members.find(member => !member._id.equals(userId));
                const otherUserId = otherMember._id.toString();
                if (otherUserId) {
                    const otherUser: IUser = await User.findById(otherUserId);
                    if (otherUser) {
                        if (otherUser.isOnline) {
                            isOnline = true;
                        } else {
                            lastOnline = otherUser.lastOnline;
                        }
                    }
                }
            }

            return {
                roomId: room._id,
                title: title,
                avatar: avatar,
                type: room.type,
                isOnline: isOnline,
                lastOnline: lastOnline,
                members: room.members,
                lastMessage: {
                    content: lastMessage ? lastMessage.lastMessage.content : null,
                    createAt: lastMessage ? lastMessage.lastMessage.createdAt : null,
                    userId: lastMessage ? lastMessage.lastMessage.userId : null
                }
            };
        }));

        result.sort((a, b) => {
            if (!a.lastMessage.createAt && !b.lastMessage.createAt) return 0;
            if (!a.lastMessage.createAt) return 1;
            if (!b.lastMessage.createAt) return -1;
            return b.lastMessage.createAt.getTime() - a.lastMessage.createAt.getTime();
        });

        return res.status(200).json({ rooms: result });
    } catch (e) {
        return res.status(500).json({ message: "Internal server error." })
    }
}

// [GET] /api/v1/chat/:roomId
export const getMessageForRoom = async (req: Request & { currentUser?: object }, res: Response): Promise<Response> => {
    try {
        const roomId = req.params.roomId;

        const chats = await Chat.find({
            roomChatId: roomId,
            deleted: false
        })
            .sort({ createdAt: 'asc' })
            .populate("userId", "fullName avatar");

        return res.status(200).json({ chats: chats });
    } catch (e) {
        return res.status(500).json({ message: "Internal server error." })
    }
}