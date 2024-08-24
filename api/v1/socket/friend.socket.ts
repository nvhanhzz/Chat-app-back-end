import { Socket } from "socket.io";
import ListStatus from "../../../enums/status.enums";
import User from "../models/user.model";
import { UserInterface } from "../../../helper/userSocket";
import { io, UserSocketMap } from "./index.socket";
import Notification from "../models/notification.model";
import ListType from "../../../enums/notificationType.enums";

export const friendSocket = async (socket: Socket, currentUser: UserInterface, users: UserSocketMap) => {
    socket.on("ADD_FRIEND", async (data: { userId: string }) => {
        const userId: string = data.userId;
        const user = await User.findOne({
            _id: userId,
            deleted: false,
            status: ListStatus.ACTIVE
        });

        if (
            !user ||
            userId === currentUser._id.toString() ||
            currentUser.friendList.includes(userId) ||
            currentUser.receivedFriendRequests.includes(userId) ||
            currentUser.sentFriendRequests.includes(userId)
        ) {
            return;
        }

        // Cập nhật danh sách yêu cầu kết bạn
        await User.updateOne(
            { _id: currentUser._id },
            { $push: { sentFriendRequests: userId } }
        );

        await User.updateOne(
            { _id: userId },
            { $push: { receivedFriendRequests: currentUser._id } }
        );

        // Lưu thông báo vào cơ sở dữ liệu
        const notification = new Notification({
            senderId: currentUser._id,
            receiverId: userId,
            type: ListType.FRIEND_REQUEST,
            linkTo: `/friends/requests`,
            isRead: false
        });

        await notification.save();

        const populatedNotification = await Notification.findById(notification._id)
            .populate('senderId', 'fullName avatar slug');

        // Gửi sự kiện tới người gửi
        socket.emit("SERVER_EMIT_SENT_FRIEND_REQUEST");

        // Gửi sự kiện tới người nhận (nếu đang kết nối)
        const sockets = users[userId];
        if (sockets && sockets.length > 0) {
            sockets.forEach((socketId) => {
                io.to(socketId).emit("SERVER_EMIT_RECIVE_FRIEND_REQUEST", { notification: populatedNotification });
            });
        }
    });
};
