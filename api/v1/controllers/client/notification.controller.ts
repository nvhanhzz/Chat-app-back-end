import { Request, Response } from "express";
import Notification from "../../models/notification.model";
import { UserInterface } from "../../../../helper/userSocket";

// [GET] /api/v1/chat/
export const index = async (req: Request & { currentUser?: UserInterface }, res: Response): Promise<Response> => {
    try {
        const notifications = await Notification.find({
            receiverId: req.currentUser._id,
            deleted: false
        })
            .sort({ createdAt: 'desc' })
            .populate("senderId", "fullName avatar slug");

        return res.status(200).json({ notifications: notifications });
    } catch (e) {
        return res.status(500).json({ message: "Lỗi server." })
    }
}