import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import { UserInterface } from "../../../../helper/userSocket";
import RoomChat from "../../models/roomChat.model";
import RoomType from "../../../../enums/roomType.enums";
import User from "../../models/user.model";

// [GET] /api/v1/chat/rooms
export const getRoomsChatForUser = async (req: Request & { currentUser?: UserInterface }, res: Response): Promise<Response> => {
    try {
        const userId = req.currentUser._id;

        const rooms = await RoomChat.find({ members: userId });
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
            if (room.type === RoomType.OneToOne) {
                const members: string[] = room.members.map(member => member.toString());
                const otherUserId = members.find(id => id !== String(userId));
                if (otherUserId) {
                    const otherUser = await User.findById(otherUserId);
                    if (otherUser) {
                        avatar = otherUser.avatar;
                        title = otherUser.fullName || title;
                    }
                }
            }

            return {
                roomId: room._id,
                title: title,
                avatar: avatar,
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
        return res.status(500).json({ message: "Lỗi server." })
    }
}