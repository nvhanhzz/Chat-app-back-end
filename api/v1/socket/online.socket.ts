import RoomType from "../../../enums/roomType.enums";
import { UserInterface } from "../../../helper/userSocket";
import RoomChat from "../models/roomChat.model";
import { io, UserSocketMap } from "./index.socket";

const onlineSocket = async (currentUser: UserInterface, users: UserSocketMap, data: { isOnline: boolean, lastOnline: Date }) => {
    for (const user of currentUser.friendList) {
        const userId = user.user_id;
        if (users[userId]) {
            const sockets = users[userId];
            if (Array.isArray(sockets) && sockets.length > 0) {
                const room = await RoomChat.findOne({
                    type: RoomType.OneToOne,
                    members: {
                        $all: [
                            currentUser._id,
                            userId
                        ]
                    }
                });

                if (room) {
                    const updatedData = {
                        ...data,
                        userId: userId,
                        roomId: room._id
                    };

                    sockets.forEach((socketId) => {
                        io.to(socketId).emit("SERVER_EMIT_ONLINE", updatedData);
                    });
                }
            }
        }
    }
};

export default onlineSocket;