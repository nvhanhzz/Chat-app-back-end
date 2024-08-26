import { Socket } from "socket.io";
import ListStatus from "../../../enums/status.enums";
import User from "../models/user.model";
import { UserInterface } from "../../../helper/userSocket";
import { io, UserSocketMap } from "./index.socket";
import Notification from "../models/notification.model";
import ListType from "../../../enums/notificationType.enums";
import RoomChat from "../models/roomChat.model";
import RoomType from "../../../enums/roomType.enums";

const getCurrentUserRealTime = async (currentUser: UserInterface): Promise<UserInterface> => {
    const curentUserRealTime: UserInterface = await User.findOne({
        _id: currentUser._id,
        status: ListStatus.ACTIVE,
        deleted: false
    }).select("-password");

    return curentUserRealTime;
}

export const friendSocket = async (socket: Socket, currentUser: UserInterface, users: UserSocketMap) => {
    socket.on("ADD_FRIEND", async (data: { userId: string }) => {
        const currentUserRealTime: UserInterface = await getCurrentUserRealTime(currentUser);

        const userId: string = data.userId;
        const user = await User.findOne({
            _id: userId,
            deleted: false,
            status: ListStatus.ACTIVE
        });

        if (
            !user ||
            userId === currentUser._id.toString() ||
            currentUserRealTime.friendList.some(friend => friend.user_id.toString() === userId) ||
            currentUserRealTime.receivedFriendRequests.includes(userId) ||
            currentUserRealTime.sentFriendRequests.includes(userId)
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

    socket.on("ACCEPT_FIEND_REQUEST", async (data: { userId: string }) => {
        const currentUserRealTime: UserInterface = await getCurrentUserRealTime(currentUser);

        const userId: string = data.userId;
        const user = await User.findOne({
            _id: userId,
            deleted: false,
            status: ListStatus.ACTIVE
        });

        if (
            !user ||
            userId === currentUser._id.toString() ||
            currentUserRealTime.friendList.some(friend => friend.user_id.toString() === userId) ||
            !currentUserRealTime.receivedFriendRequests.includes(userId) ||
            currentUserRealTime.sentFriendRequests.includes(userId)
        ) {
            return;
        }

        const roomChat = new RoomChat({
            title: '',
            members: [currentUser._id, userId],
            type: RoomType.OneToOne,
        });

        const notification = new Notification({
            senderId: currentUser._id,
            receiverId: userId,
            type: ListType.ACCEPT_FRIEND,
            linkTo: `/user/${userId}`,
            isRead: false
        });

        await Promise.all([
            User.updateOne(
                { _id: currentUser._id },
                {
                    $push: { friendList: { user_id: userId } },
                    $pull: { receivedFriendRequests: userId }
                }
            ),
            User.updateOne(
                { _id: userId },
                {
                    $push: { friendList: { user_id: currentUser._id } },
                    $pull: { sentFriendRequests: currentUser._id }
                }
            ),
            Notification.deleteOne({
                senderId: userId,
                receiverId: currentUser._id,
                type: ListType.FRIEND_REQUEST
            }),
            notification.save(),
            roomChat.save()
        ]);

        const populatedNotification = await Notification.findById(notification._id)
            .populate('senderId', 'fullName avatar slug');

        socket.emit("SERVER_EMIT_ACCEPT_FIEND");

        const sockets = users[userId];
        if (sockets && sockets.length > 0) {
            sockets.forEach((socketId) => {
                io.to(socketId).emit("SERVER_EMIT_RECIVE_ACCEPT_FRIEND", { notification: populatedNotification });
            });
        }
    });

    socket.on("CANCEL_FIEND_REQUEST", async (data: { userId: string }) => {
        const currentUserRealTime: UserInterface = await getCurrentUserRealTime(currentUser);

        const userId: string = data.userId;
        const user = await User.findOne({
            _id: userId,
            deleted: false,
            status: ListStatus.ACTIVE
        });

        if (
            !user ||
            userId === currentUser._id.toString() ||
            currentUserRealTime.friendList.some(friend => friend.user_id.toString() === userId) ||
            currentUserRealTime.receivedFriendRequests.includes(userId) ||
            !currentUserRealTime.sentFriendRequests.includes(userId)
        ) {
            return;
        }

        const notfMustDel = await Notification.findOne({
            receiverId: userId,
            senderId: currentUser._id,
            type: ListType.FRIEND_REQUEST
        }).populate('senderId', 'fullName avatar slug');

        await Promise.all([
            User.updateOne(
                { _id: currentUser._id },
                {
                    $pull: { sentFriendRequests: userId }
                }
            ),
            User.updateOne(
                { _id: userId },
                {
                    $pull: { receivedFriendRequests: currentUser._id }
                }
            ),
            Notification.findByIdAndDelete(notfMustDel.id)
        ]);

        socket.emit("SERVER_EMIT_CANCEL_FIEND_REQUEST");

        const sockets = users[userId];
        if (sockets && sockets.length > 0) {
            sockets.forEach((socketId) => {
                io.to(socketId).emit("SERVER_EMIT_RECIVE_CANCEL_FIEND_REQUEST", { notification: notfMustDel });
            });
        }
    });
};