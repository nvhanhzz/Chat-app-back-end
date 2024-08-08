import { Request, Response } from "express";
import Chat from "../../models/chat.model";

// [GET] /api/v1/chat/
export const index = async (req: Request & { currentUser?: object }, res: Response): Promise<Response> => {
    try {
        const chats = await Chat.find({ deleted: false })
            .sort({ createdAt: 'asc' })
            .populate("userId", "fullName avatar");

        return res.status(200).json({ chats: chats });
    } catch (e) {
        return res.status(500).json({ message: "Lỗi server." })
    }
}