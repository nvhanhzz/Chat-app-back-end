import { Request, Response } from "express";
import Notification from "../../models/notification.model";
import { UserInterface } from "../../../../helper/userSocket";

// [GET] /api/v1/notification/
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

// [PATCH] /api/v1/notification/mark-notification-as-read
export const markNotificationAsRead = async (req: Request & { currentUser?: UserInterface }, res: Response): Promise<Response> => {
    try {
        const notificationId = req.body.notificationId;

        // Kiểm tra xem notificationId có tồn tại trong yêu cầu không
        if (!notificationId) {
            return res.status(400).json({ message: 'notificationId is required.' });
        }

        // Cập nhật thông báo thành đã đọc
        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiverId: req.currentUser._id },
            { isRead: true },
            { new: true }
        ).populate('senderId', 'fullName avatar slug');

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found or not authorized.' });
        }

        return res.status(200).json({ message: 'Set notification as read success.' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error.' });
    }
};