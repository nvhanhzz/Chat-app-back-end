import { getSocket } from "./socket";
import { checkUser, UserInterface } from "../../../helper/userSocket";
import { Socket } from "socket.io";
import User from "../models/user.model";
import ListStatus from "../../../enums/status.enums";

interface friendRequest {
    userId: string
}

const friendSocket = async (): Promise<void> => {
    const key = process.env.JWT_SIGNATURE as string;
    const io = getSocket();

    io.on('connection', async (socket: Socket) => {
        const currentUser: UserInterface = await checkUser(socket, key);
        if (!currentUser) {
            socket.disconnect();
            return;
        }

        socket.on("ADD_FRIEND", async (data: friendRequest) => {
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

            await User.updateOne(
                { _id: currentUser._id },
                { $push: { sentFriendRequests: userId } }
            );

            await User.updateOne(
                { _id: userId },
                { $push: { receivedFriendRequests: currentUser._id } }
            );

            socket.emit("SERVER_EMIT_SENT_FRIEND_REQUEST", { to: userId });

            socket.to(userId).emit("SERVER_EMIT_RECIVE_FRIEND_REQUEST", { from: currentUser._id });
        });
    });
};

export default friendSocket;